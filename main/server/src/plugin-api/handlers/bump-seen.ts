import { touchPluginCurrent } from "../../database/index.js";
import { logPluginError } from "../logger/index.js";
import { IN_WORLD_LOGIN_STATES } from "../session/login-states.js";
import { isTelemetryAllowed } from "../session/telemetry-gate.js";
import type { DispatchContext } from "./dispatch-types.js";

export function bumpSeen(ctx: DispatchContext): void {
    const { state, sessionId } = ctx;
    if (!state.authed || !state.sockClanId || !state.sockMode || !state.sessionAccount) return;
    if (!isTelemetryAllowed(state.clanStatus)) return;
    try {
        touchPluginCurrent(
            state.sockClanId,
            state.sockMode,
            state.sessionAccount,
            IN_WORLD_LOGIN_STATES.has(state.loginState),
        );
    } catch (err) {
        logPluginError(sessionId, `current_state touch failed: ${(err as Error).message}`);
    }
}
