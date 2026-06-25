import { DB_NAMES, getDb } from "../../core/database.js";

export type RunewatchTier = "hard" | "soft";
export type RunewatchSource = "RW" | "WDR";

export interface RunewatchCaseRow {
    case_key: string;
    hash: string | null;
    tier: RunewatchTier;
    accused_rsn: string;
    rsn_normalized: string;
    reason: string;
    evidence_rating: number | null;
    source: RunewatchSource;
    quick_find: string | null;
    published_at: number | null;
    synced_at: number;
}

const SELECT_SQL = `SELECT case_key, hash, tier, accused_rsn, rsn_normalized, reason,
                           evidence_rating, source, quick_find, published_at, synced_at
                    FROM clansocket_runewatch_cases
                    WHERE rsn_normalized = ?
                    ORDER BY tier ASC, published_at DESC`;

export function casesByRsn(rsnNormalized: string): RunewatchCaseRow[] {
    return getDb(DB_NAMES.APP).prepare(SELECT_SQL).all(rsnNormalized) as RunewatchCaseRow[];
}
