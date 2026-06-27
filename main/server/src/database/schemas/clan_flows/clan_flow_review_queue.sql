CREATE TABLE IF NOT EXISTS clan_flow_review_queue (
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

CREATE INDEX IF NOT EXISTS idx_clan_flow_review_queue_status ON clan_flow_review_queue (status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_clan_flow_review_queue_flow ON clan_flow_review_queue (flow_id, status);
