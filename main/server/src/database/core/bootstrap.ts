import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { wrapDbWrites } from "../../data-rights/streams/writes-watcher.js";
import { scopeKeyBuiltin } from "../../data-rights/streams/writes-stream.js";
import { getCachedConnection, setCachedConnection } from "./db-cache.js";
import {
    DB_NAMES,
    DISCORD_BOT_SCHEMA_KEY,
    DISCORD_RATE_LIMITS_SCHEMA_KEY,
    PLUGIN_DB_PREFIX,
    PLUGIN_SCHEMA_KEY,
} from "./db-constants.js";
import { DATA_DIR, dbPath, staticDbKey, staticDbPath } from "./db-paths.js";
import { applyMigrations } from "./migrator/migration-runner.js";
import { applySchemas } from "./apply-schemas.js";

export { applySchemas } from "./apply-schemas.js";

export function applyBootstrap(db: Database.Database, schemaKey: string): void {
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 3000");
    db.pragma("foreign_keys = ON");
    applySchemas(db, schemaKey);
    applyMigrations(db, schemaKey);
}

export function builtinSchemaKey(name: string): string {
    if (name === DB_NAMES.APP) return "clansocket";
    if (name === DB_NAMES.AI) return "varez";
    if (name === DB_NAMES.DISCORD_BOT) return DISCORD_BOT_SCHEMA_KEY;
    if (name === DB_NAMES.DISCORD_RATE_LIMITS) return DISCORD_RATE_LIMITS_SCHEMA_KEY;
    if (name.startsWith(PLUGIN_DB_PREFIX)) return PLUGIN_SCHEMA_KEY;
    return name;
}

export function openDb(name: string): Database.Database {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const db = new Database(dbPath(name));
    applyBootstrap(db, builtinSchemaKey(name));
    const wrapKey = scopeKeyBuiltin(name);
    if (wrapKey) wrapDbWrites(db, wrapKey);
    setCachedConnection(name, db);
    return db;
}

export function openStaticDb(name: string): Database.Database {
    const key = staticDbKey(name);
    const cached = getCachedConnection(key);
    if (cached) return cached;
    const dbFile = staticDbPath(name);
    mkdirSync(dirname(dbFile), { recursive: true });
    const db = new Database(dbFile);
    applyBootstrap(db, name);
    setCachedConnection(key, db);
    return db;
}
