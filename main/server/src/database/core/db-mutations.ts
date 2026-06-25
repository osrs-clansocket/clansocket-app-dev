import type Database from "better-sqlite3";

export function runMutation(db: Database.Database, sql: string, ...params: unknown[]): boolean {
    const result = db.prepare(sql).run(...params);
    return result.changes > 0;
}

export function execMutation(db: Database.Database, sql: string, ...params: unknown[]): void {
    db.prepare(sql).run(...params);
}
