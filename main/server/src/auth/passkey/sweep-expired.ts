import { DB_NAMES, getDb } from "../../database/index.js";

export function sweepExpiredRows(table: string, now: number, extraOr?: string): void {
    const db = getDb(DB_NAMES.APP);
    const tail = extraOr ? ` OR ${extraOr}` : "";
    db.prepare(`DELETE FROM ${table} WHERE expires_at <= ?${tail}`).run(now);
}
