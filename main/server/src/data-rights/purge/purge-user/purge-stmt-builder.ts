import type Database from "better-sqlite3";
import type { PurgeUserResult } from "./types.js";

export interface TableColSpec {
    table: string;
    column: string;
}

export function buildDeleteStmt(db: Database.Database, table: string, column: string): Database.Statement {
    return db.prepare(`DELETE FROM ${table} WHERE ${column} = ?`);
}

export interface PreparedTableDelete {
    table: string;
    stmt: Database.Statement;
}

export function prepareTableDelete(db: Database.Database, spec: TableColSpec): PreparedTableDelete {
    return { table: spec.table, stmt: buildDeleteStmt(db, spec.table, spec.column) };
}

type DeleteBag = Record<string, number>;

export function accumulateTableChanges(bag: DeleteBag, key: string, changes: number): void {
    if (changes > 0) bag[key] = (bag[key] ?? 0) + changes;
}

export function runDeleteStmt(stmt: Database.Statement, key: string, arg: string, bag: DeleteBag): boolean {
    const r = stmt.run(arg);
    if (r.changes === 0) return false;
    accumulateTableChanges(bag, key, r.changes);
    return true;
}

export function bagFor(target: "app" | "varez" | "discord", result: PurgeUserResult): DeleteBag {
    if (target === "app") return result.appTableDeletes;
    if (target === "varez") return result.varezTableDeletes;
    return result.discordTableDeletes;
}
