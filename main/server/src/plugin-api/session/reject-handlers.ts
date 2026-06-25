import { PLUGIN_STALE_IDENTITY_EVENT_CAP, WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { EVENT_REIDENTIFY } from "../event-types.js";
import { send } from "../transport/send.js";
import type { PluginSocket, PluginSocketState } from "./socket-state.js";

export { rejectUnauthed } from "./reject-unauthed.js";
export { handleLoggedOut } from "./handle-logged-out.js";

export function handleStaleIdentity(ws: PluginSocket, state: PluginSocketState): void {
    send(ws, { type: EVENT_REIDENTIFY });
    state.staleIdentityEventCount += 1;
    if (state.staleIdentityEventCount >= PLUGIN_STALE_IDENTITY_EVENT_CAP) {
        ws.close(WS_CODE_POLICY_VIOLATION, "reidentify ignored");
    }
}
