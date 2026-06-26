import { DB_NAMES, getDb } from "../../core/database.js";
import { sqlPlaceholders } from "../../core/operations/index.js";

const CHUNK_SIZE = 500;

const SELECT_ALL_KEYS_SQL = `SELECT case_key FROM clansocket_runewatch_cases`;

interface CaseKeyRow {
    case_key: string;
}

export function deleteMissing(seenKeys: Set<string>): number {
    const db = getDb(DB_NAMES.APP);
    const allKeyRows = db.prepare(SELECT_ALL_KEYS_SQL).all() as CaseKeyRow[];
    const allKeys = allKeyRows.map((r) => r.case_key);
    const toDelete = allKeys.filter((k) => !seenKeys.has(k));
    if (toDelete.length === 0) return 0;
    let deleted = 0;
    const txn = db.transaction((chunk: string[]) => {
        const sql = `DELETE FROM clansocket_runewatch_cases WHERE case_key IN (${sqlPlaceholders(chunk.length)})`;
        const result = db.prepare(sql).run(...chunk);
        deleted += Number(result.changes);
    });
    for (let i = 0; i < toDelete.length; i += CHUNK_SIZE) {
        txn(toDelete.slice(i, i + CHUNK_SIZE));
    }
    return deleted;
}
