import { getDb, getStaticDb } from "./database.js";

function runInsert(
    table: string,
    data: Record<string, unknown>,
    dbName: string,
    conflictMode: "REPLACE" | "IGNORE",
): { lastInsertRowid: number; changes: number } {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT OR ${conflictMode} INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
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

function eqClause(k: string): string {
    return `${k} = ?`;
}

function buildWhereClause(keys: readonly string[]): string {
    return keys.map(eqClause).join(" AND ");
}

export function select(table: string, where: Record<string, unknown>, dbName: string): unknown {
    const keys = Object.keys(where);
    let sql = `SELECT * FROM ${table}`;
    if (keys.length > 0) {
        sql += ` WHERE ${buildWhereClause(keys)}`;
    }
    return keys.length > 0
        ? getDb(dbName)
              .prepare(sql)
              .get(...Object.values(where))
        : getDb(dbName).prepare(sql).all();
}

export function deleteRows(table: string, where: Record<string, unknown>, dbName: string): { changes: number } {
    const keys = Object.keys(where);
    const sql = `DELETE FROM ${table} WHERE ${buildWhereClause(keys)}`;
    const result = getDb(dbName)
        .prepare(sql)
        .run(...Object.values(where));
    return { changes: result.changes };
}

export function transaction<T>(fn: () => T, dbName: string): T {
    return getDb(dbName).transaction(fn)();
}

export function wasWritten(result: { changes: number }): boolean {
    return result.changes > 0;
}

function pickOne<T>(stmt: { get: (...args: never[]) => unknown }, args: unknown[]): T | null {
    return (stmt.get(...(args as never[])) as T | undefined) ?? null;
}

export function selectOne<T>(dbName: string, sql: string, ...args: unknown[]): T | null {
    return pickOne<T>(getDb(dbName).prepare(sql), args);
}

export function selectColumn<T>(dbName: string, sql: string, ...args: unknown[]): T | null {
    return pickOne<T>(getDb(dbName).prepare(sql).pluck(), args);
}

export function selectOneStatic<T>(dbName: string, sql: string, ...args: unknown[]): T | null {
    return pickOne<T>(getStaticDb(dbName).prepare(sql), args);
}

export function execDb(dbName: string, sql: string, ...args: unknown[]): { changes: number } {
    return getDb(dbName)
        .prepare(sql)
        .run(...args);
}
