import type Database from "better-sqlite3";
import { DB_NAMES } from "../core/db-constants.js";
import { getDb } from "../core/database.js";

export function runBotWrite(sql: string, ...args: unknown[]): Database.RunResult {
    return getDb(DB_NAMES.DISCORD_BOT)
        .prepare(sql)
        .run(...args);
}

export function listBotRows<T>(sql: string, ...args: unknown[]): T[] {
    return getDb(DB_NAMES.DISCORD_BOT)
        .prepare(sql)
        .all(...args) as T[];
}
