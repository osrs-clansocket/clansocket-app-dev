import { clanPluginDb } from "../../core/database.js";
import { clearActivePrayers } from "../projection/prayers.js";

export function markPluginDisconnected(clanId: string, mode: string, accountHash: string): void {
    const now = Date.now();
    const db = clanPluginDb(clanId, mode);
    db.prepare(
        `UPDATE plugin_connection_status
         SET ws_connected = 0, disconnected_at = $now, latency_ms = NULL, updated_at = $now
         WHERE account_hash = $accountHash`,
    ).run({ now, accountHash });
    db.prepare("UPDATE plugin_current_state SET login_state = 'UNKNOWN', updated_at = ? WHERE account_hash = ?").run(
        now,
        accountHash,
    );
    clearActivePrayers(db, accountHash, now);
}
