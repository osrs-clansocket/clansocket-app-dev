import { getDb } from "../../database/core/database.js";

export function selectRows<TSql>(dbName: string, sql: string, ...args: unknown[]): TSql[] {
    return getDb(dbName)
        .prepare(sql)
        .all(...args) as TSql[];
}

export function selectColumns<T>(dbName: string, sql: string, ...args: unknown[]): T[] {
    return getDb(dbName)
        .prepare(sql)
        .pluck()
        .all(...args) as T[];
}
