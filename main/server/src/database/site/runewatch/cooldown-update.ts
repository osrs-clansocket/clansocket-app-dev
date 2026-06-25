import { DB_NAMES, getDb } from "../../core/database.js";
import type { RunewatchFetchStatus } from "./cooldown-get.js";

const UPDATE_SQL = `UPDATE clansocket_runewatch_cooldown
                    SET last_fetch_at = ?,
                        last_fetch_status = ?,
                        last_case_count = ?,
                        last_hard_count = ?,
                        last_soft_count = ?,
                        last_inserted = ?,
                        last_updated = ?,
                        last_deleted = ?
                    WHERE singleton_key = 'default'`;

export interface RunewatchCooldownUpdate {
    last_fetch_at: number;
    last_fetch_status: RunewatchFetchStatus;
    last_case_count: number;
    last_hard_count: number;
    last_soft_count: number;
    last_inserted: number;
    last_updated: number;
    last_deleted: number;
}

export function updateRunewatchCooldown(update: RunewatchCooldownUpdate): void {
    getDb(DB_NAMES.APP)
        .prepare(UPDATE_SQL)
        .run(
            update.last_fetch_at,
            update.last_fetch_status,
            update.last_case_count,
            update.last_hard_count,
            update.last_soft_count,
            update.last_inserted,
            update.last_updated,
            update.last_deleted,
        );
}
