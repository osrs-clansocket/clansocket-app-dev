import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "001-clan-flows";

const CREATE_TABLE_SQL = `
CREATE TABLE clan_flows (
    flow_id TEXT PRIMARY KEY,
    flow_name TEXT NOT NULL,
    definition_json TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    published_version INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    created_by_account_hash TEXT,
    created_by_rsn TEXT,
    updated_by_account_hash TEXT,
    updated_by_rsn TEXT
);
CREATE INDEX idx_clan_flows_enabled ON clan_flows (enabled, archived);
CREATE INDEX idx_clan_flows_updated ON clan_flows (updated_at DESC);
`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_flows"), CREATE_TABLE_SQL);
}
