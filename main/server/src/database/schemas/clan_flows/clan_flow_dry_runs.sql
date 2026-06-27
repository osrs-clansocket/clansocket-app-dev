CREATE TABLE IF NOT EXISTS clan_flow_dry_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flow_id TEXT NOT NULL,
    flow_name TEXT NOT NULL,
    flow_version INTEGER NOT NULL,
    trace_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    created_by_account_hash TEXT,
    created_by_rsn TEXT,
    auto_cleanup_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clan_flow_dry_runs_flow ON clan_flow_dry_runs (flow_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clan_flow_dry_runs_cleanup ON clan_flow_dry_runs (auto_cleanup_at);
