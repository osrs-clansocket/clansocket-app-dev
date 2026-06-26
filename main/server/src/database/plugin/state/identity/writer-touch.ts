import { clanPluginDb } from "../../../core/database.js";

export function touchPluginCurrent(clanId: string, mode: string, accountHash: string, inWorld: boolean): void {
    const now = Date.now();
    const conn = clanPluginDb(clanId, mode);
    if (inWorld) {
        conn.prepare(
            "UPDATE plugin_current_state SET last_seen_in_game = $now, last_seen = $now, updated_at = $now WHERE account_hash = $accountHash",
        ).run({ now, accountHash });
    } else {
        conn.prepare("UPDATE plugin_current_state SET last_seen = ? WHERE account_hash = ?").run(now, accountHash);
    }
}
