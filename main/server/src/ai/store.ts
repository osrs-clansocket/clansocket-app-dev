import { DB_NAMES } from "../database/core/database.js";
import { execDb, selectOne } from "../database/core/operations/index.js";

const TABLE = "varez_state";

export function storeGet(key: string): string | null {
    const row = selectOne<{ value: string }>(DB_NAMES.AI, `SELECT value FROM ${TABLE} WHERE key = ?`, key);
    return row?.value ?? null;
}

export function storeSet(key: string, value: string): void {
    execDb(
        DB_NAMES.AI,
        `INSERT OR REPLACE INTO ${TABLE} (key, value, updated_at) VALUES (?, ?, ?)`,
        key,
        value,
        Date.now(),
    );
}

export function storeRemove(key: string): void {
    execDb(DB_NAMES.AI, `DELETE FROM ${TABLE} WHERE key = ?`, key);
}
