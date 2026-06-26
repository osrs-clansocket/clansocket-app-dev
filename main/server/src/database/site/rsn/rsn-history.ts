import { DB_NAMES } from "../../core/database.js";
import { execDb } from "../../core/operations/index.js";
import type { PluginIdentityRecord } from "../../plugin/state/identity/types.js";

const UPSERT_RSN_HISTORY_SQL = `INSERT INTO clansocket_account_rsns
    (account_hash, rsn, source, current_rank, first_seen, last_seen, verified_at)
 VALUES ($accountHash, $rsn, 'plugin', $rank, $now, $now, $now)
 ON CONFLICT (account_hash, rsn) DO UPDATE SET
    source = excluded.source,
    current_rank = COALESCE(excluded.current_rank, current_rank),
    last_seen = excluded.last_seen,
    verified_at = excluded.verified_at`;

export function upsertRsnHistory(identity: PluginIdentityRecord, now: number): void {
    execDb(DB_NAMES.APP, UPSERT_RSN_HISTORY_SQL, {
        accountHash: identity.accountHash,
        rsn: identity.rsn,
        rank: identity.clanRank ?? null,
        now,
    });
}
