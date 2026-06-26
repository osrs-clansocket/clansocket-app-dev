import { clanPluginDb } from "../../../core/database.js";

export function recordPluginDisconnect(clanId: string, mode: string, sessionId: string): void {
    clanPluginDb(clanId, mode)
        .prepare(
            "UPDATE plugin_sessions SET disconnected_at = $now WHERE session_id = $sessionId AND disconnected_at IS NULL",
        )
        .run({ now: Date.now(), sessionId });
}
