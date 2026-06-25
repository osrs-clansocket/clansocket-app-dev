import Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { resolve } from "path";
import { guildScopeKey } from "../../data-rights/streams/writes-stream.js";
import { wrapDbWrites } from "../../data-rights/streams/writes-watcher.js";
import { applyBootstrap } from "../core/bootstrap.js";
import { getCachedConnection, setCachedConnection } from "../core/db-cache.js";
import { DISCORD_GUILD_SCHEMA_KEY } from "../core/db-constants.js";
import { ensureClanDir, guildDbFile, guildDbKey } from "../core/db-paths.js";

export function discordGuildDb(clanId: string, guildId: string): Database.Database {
    const key = guildDbKey(clanId, guildId);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    const dir = ensureClanDir(clanId);
    const db = new Database(resolve(dir, guildDbFile(guildId)));
    applyBootstrap(db, DISCORD_GUILD_SCHEMA_KEY);
    wrapDbWrites(db, guildScopeKey(clanId, guildId));
    setCachedConnection(key, db);
    return db;
}

export function withGuildTx(clanId: string, guildId: string, body: (db: Database.Database) => void): void {
    const db = discordGuildDb(clanId, guildId);
    db.transaction(() => body(db))();
}

export function runGuildSql(clanId: string, guildId: string, sql: string, ...params: unknown[]): void {
    discordGuildDb(clanId, guildId)
        .prepare(sql)
        .run(...params);
}

export interface ReplaceArgs<T> {
    clanId: string;
    guildId: string;
    deleteSql: string;
    rows: readonly T[];
    upsert: (row: T) => void;
    debugTag?: string;
}

export function replaceGuildRows<T>(args: ReplaceArgs<T>): void {
    const { clanId, guildId, deleteSql, rows, upsert, debugTag } = args;
    withGuildTx(clanId, guildId, (db) => {
        if (debugTag) logger.debug(`[${debugTag}] guildId=${guildId} count=${rows.length}`);
        db.prepare(deleteSql).run(guildId);
        for (const row of rows) upsert(row);
    });
}
