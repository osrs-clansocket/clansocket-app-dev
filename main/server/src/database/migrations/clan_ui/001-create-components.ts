import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "001-create-components";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS clan_ui_components (
    component_id TEXT PRIMARY KEY,
    component_name TEXT NOT NULL,
    canvas_x INTEGER NOT NULL,
    canvas_y INTEGER NOT NULL,
    canvas_w INTEGER NOT NULL,
    canvas_h INTEGER NOT NULL,
    z_index INTEGER NOT NULL DEFAULT 0,
    payload_json TEXT NOT NULL,
    token_overrides_json TEXT NOT NULL DEFAULT '{}',
    parent_id TEXT,
    account_hash TEXT,
    rsn TEXT,
    event_received_at INTEGER NOT NULL
)`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_ui_components"), CREATE_TABLE_SQL);
}
