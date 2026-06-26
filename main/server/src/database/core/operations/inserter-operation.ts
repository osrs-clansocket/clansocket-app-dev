import { getDb } from "../database.js";
import { sqlPlaceholders } from "./builder-operation.js";

function runInsert(
    table: string,
    data: Record<string, unknown>,
    dbName: string,
    conflictMode: "REPLACE" | "IGNORE",
): { lastInsertRowid: number; changes: number } {
    const keys = Object.keys(data);
    const sql = `INSERT OR ${conflictMode} INTO ${table} (${keys.join(", ")}) VALUES (${sqlPlaceholders(keys.length)})`;
    const result = getDb(dbName)
        .prepare(sql)
        .run(...Object.values(data));
    return { lastInsertRowid: Number(result.lastInsertRowid), changes: result.changes };
}

export function insert(
    table: string,
    data: Record<string, unknown>,
    dbName: string,
): { lastInsertRowid: number; changes: number } {
    return runInsert(table, data, dbName, "REPLACE");
}

export function insertIgnore(
    table: string,
    data: Record<string, unknown>,
    dbName: string,
): { lastInsertRowid: number; changes: number } {
    return runInsert(table, data, dbName, "IGNORE");
}
