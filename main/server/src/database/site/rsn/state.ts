import { DB_NAMES, getDb } from "../../core/database.js";
import { selectOne } from "../../core/operations.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";
import { FIVE_MINUTES_MS, MS_PER_DAY, MS_PER_HOUR } from "../../../shared/time.js";

export const RSN_DISPLACED_CLEANUP_DAYS = 30;
export const RSN_VERIFY_TTL_MS = MS_PER_HOUR;
export const CLAIM_CONSENT_TTL_MS = FIVE_MINUTES_MS;
export const RSN_DISPLACED_CLEANUP_MS = RSN_DISPLACED_CLEANUP_DAYS * MS_PER_DAY;
export const RSN_DISPLACED_PLACEHOLDER_LEN = 14;
export const RSN_MAX_LEN = 12;

export type RsnSource = "plugin" | "clan_claim" | "site" | "wom";

export interface AccountRsnRow {
    account_hash: string;
    rsn: string;
    source: RsnSource;
    current_rank: string | null;
    first_seen: number;
    last_seen: number;
    verified_at: number;
}

export interface SiteRsnRow extends AccountRsnRow {
    account_last_active: number;
}

export interface DisplacedSiteAccount {
    site_account_id: string;
    account_hash: string;
    last_active: number;
}

const ACCOUNT_RSN_COLUMNS = "account_hash, rsn, source, current_rank, first_seen, last_seen, verified_at";

export function placeholderFromHash(accountHash: string): string {
    return accountHash.slice(0, RSN_DISPLACED_PLACEHOLDER_LEN);
}

function latestAccountRsnBy(whereCol: string, value: string): AccountRsnRow | null {
    return selectOne<AccountRsnRow>(
        DB_NAMES.APP,
        `SELECT ${ACCOUNT_RSN_COLUMNS}
         FROM clansocket_account_rsns
         WHERE ${whereCol} = ?
         ORDER BY last_seen DESC
         LIMIT 1`,
        value,
    );
}

export function findRsnHolder(rsn: string): AccountRsnRow | null {
    return latestAccountRsnBy("rsn", rsn);
}

export function getAccountRsn(accountHash: string): AccountRsnRow | null {
    return latestAccountRsnBy("account_hash", accountHash);
}

export function rsnsByAccount(siteAccountId: string): SiteRsnRow[] {
    return selectRows<SiteRsnRow>(
        DB_NAMES.APP,
        `SELECT r.account_hash, r.rsn, r.source, r.current_rank, r.first_seen, r.last_seen, r.verified_at,
                al.account_last_active
         FROM clansocket_account_rsns r
         JOIN clansocket_account_bindings b ON b.account_hash = r.account_hash AND b.revoked_at IS NULL
         JOIN (
             SELECT account_hash, MAX(last_seen) AS account_last_active
             FROM clansocket_account_rsns
             GROUP BY account_hash
         ) al ON al.account_hash = r.account_hash
         WHERE b.site_account_id = ?
         ORDER BY r.last_seen DESC`,
        siteAccountId,
    );
}

const STALE_RSN_THRESHOLD_MS = MS_PER_DAY;
const PRUNE_GATE_MS = MS_PER_HOUR;
const lastPruneAt = { value: 0 };

export function pruneStale(now: number): number {
    if (now - lastPruneAt.value < PRUNE_GATE_MS) return 0;
    lastPruneAt.value = now;
    const db = getDb(DB_NAMES.APP);
    const cutoff = now - STALE_RSN_THRESHOLD_MS;
    const result = db
        .prepare(
            `DELETE FROM clansocket_account_rsns
             WHERE last_seen < ?
               AND account_hash NOT IN (
                   SELECT account_hash FROM clansocket_account_bindings WHERE revoked_at IS NULL
               )`,
        )
        .run(cutoff);
    return result.changes as number;
}
