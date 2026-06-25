import { recordPingPong } from "../../database/index.js";
import { logPluginError } from "../logger/index.js";
import { isTelemetryAllowed } from "../session/telemetry-gate.js";
import type { PluginSocket } from "../session/socket-state.js";

type PongState = NonNullable<PluginSocket["pluginState"]> & {
    sockMode: string;
    sockClanId: string;
    sessionAccount: string;
};

function canRecord(state: NonNullable<PluginSocket["pluginState"]>): state is PongState {
    if (!state.authed || state.lastPingAt <= 0) return false;
    if (!state.sockMode || !state.sockClanId || !state.sessionAccount) return false;
    return isTelemetryAllowed(state.clanStatus);
}

export function onPong(ws: PluginSocket, sessionId: string): void {
    const state = ws.pluginState;
    if (!state) return;
    state.isAlive = true;
    const now = Date.now();
    if (state.lastPingAt > 0) state.lastRttMs = now - state.lastPingAt;
    if (canRecord(state)) {
        try {
            recordPingPong({
                clanId: state.sockClanId,
                mode: state.sockMode,
                accountHash: state.sessionAccount,
                pingAt: state.lastPingAt,
                pongAt: now,
            });
        } catch (err) {
            logPluginError(sessionId, `pong record failed: ${(err as Error).message}`);
        }
    }
}
