import type Database from "better-sqlite3";
import type { PreparedTableDelete, TableColSpec } from "./purge-stmt-types.js";

export function buildDeleteStmt(db: Database.Database, table: string, column: string): Database.Statement {
    return db.prepare(`DELETE FROM ${table} WHERE ${column} = ?`);
}

export function prepareTableDelete(db: Database.Database, spec: TableColSpec): PreparedTableDelete {
    return { table: spec.table, stmt: buildDeleteStmt(db, spec.table, spec.column) };
}
