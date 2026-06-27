CREATE TABLE IF NOT EXISTS clan_flow_idempotency (
    key TEXT PRIMARY KEY,
    flow_id TEXT,
    trigger_id TEXT,
    fired_at INTEGER NOT NULL,
    retention_until INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clan_flow_idempotency_retention ON clan_flow_idempotency (retention_until);
