import type Database from "better-sqlite3";
import { existsSync, readdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import {
    CLAN_AUDIT_SCHEMA_KEY,
    CLAN_FLOWS_SCHEMA_KEY,
    CLAN_SCHEMA_KEY,
    CLAN_UI_SCHEMA_KEY,
    CLAN_VAULT_SCHEMA_KEY,
    DISCORD_BOT_SCHEMA_KEY,
    DISCORD_GUILD_SCHEMA_KEY,
    DISCORD_RATE_LIMITS_SCHEMA_KEY,
    PLUGIN_SCHEMA_KEY,
} from "../db-constants.js";

interface Migration {
    id: string;
    ensure: (db: Database.Database) => void;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_ROOT = resolve(__dirname, "..", "..", "migrations");
const SKIP_FLAG_VALUE = "1";

const ALL_SCHEMA_KEYS: readonly string[] = [
    "clansocket",
    "varez",
    DISCORD_BOT_SCHEMA_KEY,
    DISCORD_RATE_LIMITS_SCHEMA_KEY,
    DISCORD_GUILD_SCHEMA_KEY,
    PLUGIN_SCHEMA_KEY,
    CLAN_SCHEMA_KEY,
    CLAN_AUDIT_SCHEMA_KEY,
    CLAN_VAULT_SCHEMA_KEY,
    CLAN_UI_SCHEMA_KEY,
    CLAN_FLOWS_SCHEMA_KEY,
    "world_map",
    "game_ids",
];

const MIGRATION_REGISTRY = new Map<string, Migration[]>();

export class MigrationError extends Error {
    public readonly schemaKey: string;
    public readonly migrationId: string;
    public readonly migrationOrigin: unknown;

    constructor(schemaKey: string, migrationId: string, migrationOrigin: unknown) {
        const originText = migrationOrigin instanceof Error ? migrationOrigin.message : String(migrationOrigin);
        super(`migration failed: ${schemaKey}/${migrationId} — ${originText}`);
        this.name = "MigrationError";
        this.schemaKey = schemaKey;
        this.migrationId = migrationId;
        this.migrationOrigin = migrationOrigin;
    }
}

function isMigrationFile(name: string): boolean {
    return name.endsWith(".ts") || name.endsWith(".js");
}

function listMigrationFiles(dir: string): string[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(isMigrationFile).sort();
}

async function loadMigrationFile(schemaKey: string, dir: string, file: string): Promise<Migration> {
    const url = pathToFileURL(resolve(dir, file)).href;
    const mod = (await import(url)) as { id?: unknown; ensure?: unknown };
    if (typeof mod.id !== "string" || typeof mod.ensure !== "function") {
        throw new Error(`migration module ${schemaKey}/${file} must export 'id: string' and 'ensure(db): void'`);
    }
    return { id: mod.id, ensure: mod.ensure as Migration["ensure"] };
}

async function loadKindMigrations(schemaKey: string): Promise<readonly Migration[]> {
    const dir = resolve(MIGRATIONS_ROOT, schemaKey);
    const files = listMigrationFiles(dir);
    const loaded: Migration[] = [];
    for (const file of files) {
        loaded.push(await loadMigrationFile(schemaKey, dir, file));
    }
    return loaded;
}

export async function loadMigrationRegistry(): Promise<void> {
    MIGRATION_REGISTRY.clear();
    for (const schemaKey of ALL_SCHEMA_KEYS) {
        const loaded = await loadKindMigrations(schemaKey);
        if (loaded.length > 0) MIGRATION_REGISTRY.set(schemaKey, [...loaded]);
    }
}

function runOneMigration(db: Database.Database, schemaKey: string, migration: Migration): void {
    try {
        db.exec("BEGIN IMMEDIATE");
        migration.ensure(db);
        db.exec("COMMIT");
    } catch (err) {
        try {
            db.exec("ROLLBACK");
        } catch {
            void 0;
        }
        throw new MigrationError(schemaKey, migration.id, err);
    }
}

export function applyMigrations(db: Database.Database, schemaKey: string): void {
    if (process.env.SKIP_MIGRATIONS === SKIP_FLAG_VALUE) return;
    const migrations = MIGRATION_REGISTRY.get(schemaKey);
    if (!migrations || migrations.length === 0) return;
    for (const migration of migrations) {
        runOneMigration(db, schemaKey, migration);
    }
}
