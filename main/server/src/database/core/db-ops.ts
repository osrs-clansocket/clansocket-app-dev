import type Database from "better-sqlite3";

export { placeholdersFor } from "./db-placeholders.js";
export { runMutation, execMutation } from "./db-mutations.js";

export function getOne<T>(db: Database.Database, sql: string, ...params: unknown[]): T | null {
    const row = db.prepare(sql).get(...params) as T | undefined;
    return row ?? null;
}

export function getMany<T>(db: Database.Database, sql: string, ...params: unknown[]): T[] {
    return db.prepare(sql).all(...params) as T[];
}

export function exists(db: Database.Database, sql: string, ...params: unknown[]): boolean {
    return db.prepare(sql).get(...params) !== undefined;
}
