import { getDb } from "../database.js";
import { buildWhereClause } from "./builder-operation.js";

export function deleteRows(table: string, where: Record<string, unknown>, dbName: string): { changes: number } {
    const keys = Object.keys(where);
    const sql = `DELETE FROM ${table} WHERE ${buildWhereClause(keys)}`;
    const result = getDb(dbName)
        .prepare(sql)
        .run(...Object.values(where));
    return { changes: result.changes };
}
