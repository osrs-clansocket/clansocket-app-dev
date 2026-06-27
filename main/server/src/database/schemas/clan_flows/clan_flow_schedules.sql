CREATE TABLE IF NOT EXISTS clan_flow_schedules (
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

CREATE INDEX IF NOT EXISTS idx_clan_flow_schedules_next ON clan_flow_schedules (enabled, next_fire_at);
