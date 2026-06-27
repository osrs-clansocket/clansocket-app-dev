import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "007-clan-flow-schedules";

const CREATE_SQL = `
CREATE TABLE clan_flow_schedules (
    flow_id TEXT PRIMARY KEY,
    flow_name TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    cron_expression TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    last_fire_at INTEGER,
    next_fire_at INTEGER NOT NULL,
    locked_by TEXT,
    locked_at INTEGER
);
CREATE INDEX idx_clan_flow_schedules_next ON clan_flow_schedules (enabled, next_fire_at);
`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_flow_schedules"), CREATE_SQL);
}
