import { DB_NAMES, getDb } from "../../core/database.js";
import { selectColumn } from "../../core/operations.js";
import { RSN_DISPLACED_CLEANUP_MS, type DisplacedSiteAccount } from "./state.js";

const DISPLACED_PURGE_SQL = `WITH account_last AS (
     SELECT account_hash, MAX(last_seen) AS account_last_active
     FROM clansocket_account_rsns
     GROUP BY account_hash
 ),
 rsn_current_holder AS (
     SELECT r.rsn, r.account_hash
     FROM clansocket_account_rsns r
     WHERE r.last_seen = (
         SELECT MAX(r2.last_seen) FROM clansocket_account_rsns r2 WHERE r2.rsn = r.rsn
     )
 )
 SELECT b.site_account_id, al.account_hash, al.account_last_active AS last_active
 FROM account_last al
 JOIN clansocket_account_bindings b ON b.account_hash = al.account_hash
 WHERE al.account_last_active < ?
   AND b.revoked_at IS NULL
   AND NOT EXISTS (
       SELECT 1 FROM rsn_current_holder h WHERE h.account_hash = al.account_hash
   )`;

export function displacedToPurge(now: number = Date.now()): DisplacedSiteAccount[] {
    const cutoff = now - RSN_DISPLACED_CLEANUP_MS;
    return getDb(DB_NAMES.APP).prepare(DISPLACED_PURGE_SQL).all(cutoff) as DisplacedSiteAccount[];
}

export function rsnSeen(rsn: string): string | null {
    return selectColumn<string>(
        DB_NAMES.APP,
        `SELECT account_hash FROM clansocket_account_rsns
         WHERE rsn = ?
         ORDER BY last_seen DESC
         LIMIT 1`,
        rsn,
    );
}
