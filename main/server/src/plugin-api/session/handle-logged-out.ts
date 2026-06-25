import { PLUGIN_LOGIN_REQUIRED_EVENT_CAP, WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { send } from "../transport/send.js";
import type { PluginSocket, PluginSocketState } from "./socket-state.js";

export function handleLoggedOut(ws: PluginSocket, state: PluginSocketState): void {
    send(ws, { type: "error", reason: "not logged in" });
    state.notLoggedInEventCount += 1;
    if (state.notLoggedInEventCount >= PLUGIN_LOGIN_REQUIRED_EVENT_CAP) {
        ws.close(WS_CODE_POLICY_VIOLATION, "telemetry while logged out");
    }
}
