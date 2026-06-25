import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../core/database.js";
import type { RunewatchCaseRow } from "./lookup-by-rsn.js";

const UPSERT_SQL = `INSERT INTO clansocket_runewatch_cases (
    case_key, hash, tier, accused_rsn, rsn_normalized, reason,
    evidence_rating, source, quick_find, published_at, synced_at
) VALUES (
    $case_key, $hash, $tier, $accused_rsn, $rsn_normalized, $reason,
    $evidence_rating, $source, $quick_find, $published_at, $synced_at
)
ON CONFLICT(case_key) DO UPDATE SET
    hash = excluded.hash,
    tier = excluded.tier,
    accused_rsn = excluded.accused_rsn,
    rsn_normalized = excluded.rsn_normalized,
    reason = excluded.reason,
    evidence_rating = excluded.evidence_rating,
    source = excluded.source,
    quick_find = excluded.quick_find,
    published_at = excluded.published_at,
    synced_at = excluded.synced_at`;

export interface RunewatchUpsertResult {
    inserted: number;
    updated: number;
}

export function upsertRunewatchCases(rows: RunewatchCaseRow[]): RunewatchUpsertResult {
    if (rows.length === 0) return { inserted: 0, updated: 0 };
    const db = getDb(DB_NAMES.APP);
    const stmt = db.prepare(UPSERT_SQL);
    let inserted = 0;
    let updated = 0;
    const txn = db.transaction((batch: RunewatchCaseRow[]) => {
        logger.debug(`[runewatch-upsert] batch=${batch.length}`);
        for (const row of batch) {
            const result = stmt.run(row);
            if (result.changes === 1 && result.lastInsertRowid !== 0) inserted += 1;
            else updated += 1;
        }
    });
    txn(rows);
    return { inserted, updated };
}
