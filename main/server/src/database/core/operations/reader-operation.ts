import { getDb, getStaticDb } from "../database.js";
import { buildWhereClause } from "./builder-operation.js";

function pickOne<T>(stmt: { get: (...args: never[]) => unknown }, args: unknown[]): T | null {
    return (stmt.get(...(args as never[])) as T | undefined) ?? null;
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

export function selectOne<T>(dbName: string, sql: string, ...args: unknown[]): T | null {
    return pickOne<T>(getDb(dbName).prepare(sql), args);
}

export function selectColumn<T>(dbName: string, sql: string, ...args: unknown[]): T | null {
    return pickOne<T>(getDb(dbName).prepare(sql).pluck(), args);
}

export function selectOneStatic<T>(dbName: string, sql: string, ...args: unknown[]): T | null {
    return pickOne<T>(getStaticDb(dbName).prepare(sql), args);
}
