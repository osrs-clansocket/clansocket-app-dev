import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "003-clan-flow-executions";

const CREATE_SQL = `
CREATE TABLE clan_flow_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flow_id TEXT NOT NULL,
    flow_name TEXT NOT NULL,
    flow_version INTEGER NOT NULL,
    account_hash TEXT,
    rsn TEXT,
    status TEXT NOT NULL,
    current_step TEXT,
    context_json TEXT NOT NULL,
    wake_event_kind TEXT,
    wake_predicate_json TEXT,
    wake_at INTEGER,
    wake_timeout_at INTEGER,
    entered_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    terminal_at INTEGER,
    exit_reason TEXT,
    failure_reason TEXT
);
CREATE INDEX idx_clan_flow_executions_flow ON clan_flow_executions (flow_id, status, entered_at DESC);
CREATE INDEX idx_clan_flow_executions_waiting_time ON clan_flow_executions (status, wake_at) WHERE status = 'WAITING' AND wake_at IS NOT NULL;
CREATE INDEX idx_clan_flow_executions_waiting_event ON clan_flow_executions (status, wake_event_kind) WHERE status = 'WAITING' AND wake_event_kind IS NOT NULL;
CREATE INDEX idx_clan_flow_executions_rsn ON clan_flow_executions (rsn, entered_at DESC) WHERE rsn IS NOT NULL;
`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_flow_executions"), CREATE_SQL);
}
