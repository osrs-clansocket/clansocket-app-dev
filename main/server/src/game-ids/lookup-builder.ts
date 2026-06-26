import { getStaticDb, placeholdersFor, STATIC_DB_NAMES } from "../database/index.js";
import { selectOneStatic } from "../database/core/operations/index.js";

export interface LookupSpec {
    table: string;
    idCol: string;
    cols: string;
}

export interface IdLookup<T> {
    one(id: number): T | null;
    many(ids: readonly number[]): Map<number, T>;
}

export function buildIdLookup<T>(spec: LookupSpec): IdLookup<T> {
    const oneSql = `SELECT ${spec.cols} FROM ${spec.table} WHERE ${spec.idCol} = ?`;
    return {
        one(id: number): T | null {
            return selectOneStatic<T>(STATIC_DB_NAMES.GAME_IDS, oneSql, id);
        },
        many(ids: readonly number[]): Map<number, T> {
            const out = new Map<number, T>();
            if (ids.length === 0) return out;
            const sql = `SELECT ${spec.cols} FROM ${spec.table} WHERE ${spec.idCol} IN (${placeholdersFor(ids.length)})`;
            const rows = getStaticDb(STATIC_DB_NAMES.GAME_IDS)
                .prepare(sql)
                .all(...ids) as T[];
            for (const row of rows) out.set((row as Record<string, unknown>)[spec.idCol] as number, row);
            return out;
        },
    };
}
