import type Database from "better-sqlite3";
import type { ZipEntry } from "../collect-user/index.js";

export interface PreparedTableSelect {
    table: string;
    stmt: Database.Statement;
}

export function prepareTableSelect(db: Database.Database, table: string, column?: string): PreparedTableSelect {
    const sql = column ? `SELECT * FROM ${table} WHERE ${column} = ?` : `SELECT * FROM ${table}`;
    return { table, stmt: db.prepare(sql) };
}

export function prepareSelectAll(db: Database.Database, table: string): PreparedTableSelect {
    return prepareTableSelect(db, table);
}

export function prepareWhereSelect(db: Database.Database, table: string, column: string): PreparedTableSelect {
    return prepareTableSelect(db, table, column);
}

export interface PushRowsArgs {
    rows: Record<string, unknown>[];
    path: string;
    entries: ZipEntry[];
    bucket: Record<string, number>;
    table: string;
}

export function pushJsonRows(args: PushRowsArgs): boolean {
    if (args.rows.length === 0) return false;
    args.entries.push({ path: args.path, json: args.rows });
    args.bucket[args.table] = args.rows.length;
    return true;
}
