import { clanPluginDb } from "../../core/database.js";
import { lookupRsnHash } from "../rsn-lookup.js";

export function markPluginConnected(clanId: string, mode: string, accountHash: string, sessionId: string): void {
    const now = Date.now();
    const conn = clanPluginDb(clanId, mode);
    const rsn = lookupRsnHash(clanId, accountHash);
    conn.prepare(
        `INSERT INTO plugin_connection_status (account_hash, rsn, session_id, ws_connected, connected_at, disconnected_at, updated_at)
         VALUES ($accountHash, $rsn, $sessionId, 1, $now, NULL, $now)
         ON CONFLICT(account_hash) DO UPDATE SET
           rsn = COALESCE(excluded.rsn, rsn),
           session_id = excluded.session_id,
           ws_connected = 1,
           connected_at = excluded.connected_at,
           disconnected_at = NULL,
           updated_at = excluded.updated_at`,
    ).run({ accountHash, rsn, sessionId, now });
}
