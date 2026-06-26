import { getDb } from "../database.js";

export function transaction<T>(fn: () => T, dbName: string): T {
    return getDb(dbName).transaction(fn)();
}

export function execDb(dbName: string, sql: string, ...args: unknown[]): { changes: number } {
    return getDb(dbName)
        .prepare(sql)
        .run(...args);
}
