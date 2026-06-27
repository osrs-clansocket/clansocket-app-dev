CREATE TABLE IF NOT EXISTS clan_flow_runtime_holds (
    flow_id TEXT NOT NULL,
    flow_name TEXT NOT NULL,
    action_id TEXT NOT NULL,
    hold_status TEXT NOT NULL,
    set_by_account_hash TEXT,
    set_by_rsn TEXT,
    set_at INTEGER NOT NULL,
    expires_at INTEGER,
    reason TEXT,
    PRIMARY KEY (flow_id, action_id)
);

CREATE INDEX IF NOT EXISTS idx_clan_flow_runtime_holds_expires ON clan_flow_runtime_holds (expires_at)
WHERE expires_at IS NOT NULL;
