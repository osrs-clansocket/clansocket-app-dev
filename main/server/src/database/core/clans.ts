import logger from "@clansocket/logger";
import Database from "better-sqlite3";
import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { wrapDbWrites } from "../../data-rights/streams/writes-watcher.js";
import { scopeKeyClan, auditScopeKey, scopeKeyPlugin } from "../../data-rights/streams/writes-stream.js";
import { applyBootstrap } from "./bootstrap.js";
import { deleteCachedConnection, eachCachedConnection, getCachedConnection, setCachedConnection } from "./db-cache.js";
import {
    CLAN_AUDIT_DB_FILE,
    CLAN_AUDIT_SCHEMA_KEY,
    CLAN_DB_FILE,
    CLAN_SCHEMA_KEY,
    CLAN_VAULT_DB_FILE,
    CLAN_VAULT_SCHEMA_KEY,
    PLUGIN_DB_PREFIX,
    PLUGIN_SCHEMA_KEY,
} from "./db-constants.js";
import { auditDbKey, clanDbKey, clanDirPath, pluginDbKey, vaultDbKey, ensureClanDir } from "./db-paths.js";

export function getClanDb(clanId: string): Database.Database {
    const key = clanDbKey(clanId);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    const dir = ensureClanDir(clanId);
    const db = new Database(resolve(dir, CLAN_DB_FILE));
    applyBootstrap(db, CLAN_SCHEMA_KEY);
    wrapDbWrites(db, scopeKeyClan(clanId));
    setCachedConnection(key, db);
    return db;
}

export function clanAuditDb(clanId: string): Database.Database {
    const key = auditDbKey(clanId);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    const dir = ensureClanDir(clanId);
    const db = new Database(resolve(dir, CLAN_AUDIT_DB_FILE));
    applyBootstrap(db, CLAN_AUDIT_SCHEMA_KEY);
    wrapDbWrites(db, auditScopeKey(clanId));
    setCachedConnection(key, db);
    return db;
}

export function clanVaultDb(clanId: string): Database.Database {
    const key = vaultDbKey(clanId);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    const dir = ensureClanDir(clanId);
    const db = new Database(resolve(dir, CLAN_VAULT_DB_FILE));
    applyBootstrap(db, CLAN_VAULT_SCHEMA_KEY);
    setCachedConnection(key, db);
    return db;
}

export function clanPluginDb(clanId: string, mode: string): Database.Database {
    const key = pluginDbKey(clanId, mode);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    const dir = ensureClanDir(clanId);
    const db = new Database(resolve(dir, `${PLUGIN_DB_PREFIX}${mode}.db`));
    applyBootstrap(db, PLUGIN_SCHEMA_KEY);
    wrapDbWrites(db, scopeKeyPlugin(clanId, mode));
    setCachedConnection(key, db);
    return db;
}

export function pluginModes(clanId: string): string[] {
    const dir = clanDirPath(clanId);
    if (!existsSync(dir)) return [];
    const modes: string[] = [];
    for (const entry of readdirSync(dir)) {
        if (entry.startsWith(PLUGIN_DB_PREFIX) && entry.endsWith(".db")) {
            modes.push(entry.slice(PLUGIN_DB_PREFIX.length, -".db".length));
        }
    }
    return modes;
}

export function closeClanConnections(clanId: string): number {
    const prefix = `clan:${clanId}:`;
    const toDelete: string[] = [];
    eachCachedConnection((db, key) => {
        if (!key.startsWith(prefix)) return;
        try {
            db.close();
        } catch (err) {
            logger.debug(`[database-clans] close skipped ${key}: ${(err as Error).message}`);
        }
        toDelete.push(key);
    });
    for (const key of toDelete) deleteCachedConnection(key);
    return toDelete.length;
}
