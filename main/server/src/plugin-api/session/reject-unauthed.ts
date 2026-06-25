import { PLUGIN_UNAUTHED_EVENT_CAP, WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { send } from "../transport/send.js";
import type { PluginSocket, PluginSocketState } from "./socket-state.js";

export function rejectUnauthed(ws: PluginSocket, state: PluginSocketState): void {
    send(ws, { type: "error", reason: "auth required" });
    state.unauthedEventCount += 1;
    if (state.unauthedEventCount >= PLUGIN_UNAUTHED_EVENT_CAP) {
        ws.close(WS_CODE_POLICY_VIOLATION, "unauthed event flood");
    }
}
