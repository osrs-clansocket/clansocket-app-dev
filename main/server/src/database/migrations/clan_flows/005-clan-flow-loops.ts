import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "005-clan-flow-loops";

const CREATE_SQL = `
CREATE TABLE clan_flow_loops (
    flow_id TEXT PRIMARY KEY,
    flow_name TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    interval_value INTEGER NOT NULL,
    interval_unit TEXT NOT NULL,
    jitter_value INTEGER,
    jitter_unit TEXT,
    last_fire_at INTEGER,
    next_fire_at INTEGER NOT NULL,
    on_overlap TEXT NOT NULL DEFAULT 'skip',
    start_at INTEGER,
    end_at INTEGER,
    locked_by TEXT,
    locked_at INTEGER
);
CREATE INDEX idx_clan_flow_loops_next ON clan_flow_loops (enabled, next_fire_at);
CREATE INDEX idx_clan_flow_loops_lock ON clan_flow_loops (locked_by, locked_at) WHERE locked_by IS NOT NULL;
`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_flow_loops"), CREATE_SQL);
}
