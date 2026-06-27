import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "008-clan-flow-review-queue";

const CREATE_SQL = `
CREATE TABLE clan_flow_review_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flow_id TEXT NOT NULL,
    flow_name TEXT NOT NULL,
    execution_id INTEGER NOT NULL,
    action_id TEXT NOT NULL,
    operation_ref TEXT,
    resolved_inputs_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_at INTEGER NOT NULL,
    decided_at INTEGER,
    decided_by_account_hash TEXT,
    decided_by_rsn TEXT,
    decision_reason TEXT
);
CREATE INDEX idx_clan_flow_review_queue_status ON clan_flow_review_queue (status, submitted_at DESC);
CREATE INDEX idx_clan_flow_review_queue_flow ON clan_flow_review_queue (flow_id, status);
`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_flow_review_queue"), CREATE_SQL);
}
