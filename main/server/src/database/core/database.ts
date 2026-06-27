import type Database from "better-sqlite3";
import { readdir, stat } from "fs/promises";
import { openDb, openStaticDb } from "./bootstrap.js";
import { loadMigrationRegistry } from "./migrator/migration-runner.js";
import {
    cachedConnectionCount,
    deleteCachedConnection,
    eachCachedConnection,
    getCachedConnection,
} from "./db-cache.js";
import { DB_NAMES, PLUGIN_DB_PREFIX } from "./db-constants.js";
import { DATA_DIR, staticDbKey } from "./db-paths.js";

export { DB_NAMES, PLUGIN_DB_PREFIX, STATIC_DB_NAMES } from "./db-constants.js";
export { clanDirPath, clanRelPath, ensureClanDir } from "./db-paths.js";

export { closeClanConnections, clanAuditDb, clanFlowsDb, clanUiDb, getClanDb, clanPluginDb, pluginModes } from "./clans.js";

export { discordGuildDb } from "../discord/discord.js";

async function dataDirExists(): Promise<boolean> {
    try {
        await stat(DATA_DIR);
        return true;
    } catch {
        return false;
    }
}

export async function initializeDatabase(): Promise<void> {
    await loadMigrationRegistry();
    for (const name of Object.values(DB_NAMES)) {
        if (!getCachedConnection(name)) openDb(name);
    }
    if (!(await dataDirExists())) return;
    const entries = await readdir(DATA_DIR);
    for (const entry of entries) {
        if (!entry.startsWith(PLUGIN_DB_PREFIX) || !entry.endsWith(".db")) continue;
        const name = entry.slice(0, -".db".length);
        if (!getCachedConnection(name)) openDb(name);
    }
}

export function closeDatabase(): void {
    const toDelete: string[] = [];
    eachCachedConnection((db, name) => {
        db.close();
        toDelete.push(name);
    });
    for (const name of toDelete) deleteCachedConnection(name);
}

export function getDb(name: string): Database.Database {
    const db = getCachedConnection(name);
    if (!db) throw new Error(`Database "${name}" not initialized`);
    return db;
}

export function getStaticDb(name: string): Database.Database {
    const key = staticDbKey(name);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    return openStaticDb(name);
}

export function isDatabaseReady(): boolean {
    return cachedConnectionCount() > 0;
}

export function getPluginDb(mode: string): Database.Database {
    const name = `${PLUGIN_DB_PREFIX}${mode}`;
    let db = getCachedConnection(name);
    if (!db) db = openDb(name);
    return db;
}

export function listOpenModes(): string[] {
    const modes: string[] = [];
    eachCachedConnection((_db, name) => {
        if (name.startsWith(PLUGIN_DB_PREFIX)) modes.push(name.slice(PLUGIN_DB_PREFIX.length));
    });
    return modes;
}
