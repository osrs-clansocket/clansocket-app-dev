import type Database from "better-sqlite3";
import { getClanDb } from "../core/database.js";

export function runWomWrite(clanId: string, sql: string, ...args: unknown[]): Database.RunResult {
    return getClanDb(clanId)
        .prepare(sql)
        .run(...args);
}

export function listRows<T>(clanId: string, sql: string, ...args: unknown[]): T[] {
    return getClanDb(clanId)
        .prepare(sql)
        .all(...args) as T[];
}

export function clanWomRow<T>(clanId: string, sql: string, ...args: unknown[]): T | undefined {
    return getClanDb(clanId)
        .prepare(sql)
        .get(...args) as T | undefined;
}
