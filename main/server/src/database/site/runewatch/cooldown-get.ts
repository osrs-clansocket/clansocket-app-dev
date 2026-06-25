import { DB_NAMES, getDb } from "../../core/database.js";

export type RunewatchFetchStatus = "ok" | "http_error" | "parse_error";

export interface RunewatchCooldownRow {
    singleton_key: string;
    last_fetch_at: number;
    last_fetch_status: RunewatchFetchStatus;
    last_case_count: number;
    last_hard_count: number;
    last_soft_count: number;
    last_inserted: number;
    last_updated: number;
    last_deleted: number;
    updated_at: number;
}

const SELECT_SQL = `SELECT singleton_key, last_fetch_at, last_fetch_status, last_case_count,
                           last_hard_count, last_soft_count, last_inserted, last_updated, last_deleted, updated_at
                    FROM clansocket_runewatch_cooldown WHERE singleton_key = 'default'`;

const INIT_SQL = `INSERT OR IGNORE INTO clansocket_runewatch_cooldown (singleton_key) VALUES ('default')`;

export function getRunewatchCooldown(): RunewatchCooldownRow {
    const db = getDb(DB_NAMES.APP);
    let row = db.prepare(SELECT_SQL).get() as RunewatchCooldownRow | undefined;
    if (!row) {
        db.prepare(INIT_SQL).run();
        row = db.prepare(SELECT_SQL).get() as RunewatchCooldownRow | undefined;
    }
    if (!row) {
        throw new Error(`failed to initialize clansocket_runewatch_cooldown row: db=${DB_NAMES.APP}`);
    }
    return row;
}
