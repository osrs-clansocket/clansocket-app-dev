CREATE TABLE IF NOT EXISTS clan_flow_versions (
    flow_id TEXT NOT NULL,
    flow_name TEXT NOT NULL,
    version INTEGER NOT NULL,
    definition_json TEXT NOT NULL,
    shape_acknowledgements_json TEXT,
    published_at INTEGER NOT NULL,
    published_by_account_hash TEXT,
    published_by_rsn TEXT,
    PRIMARY KEY (flow_id, version)
);

CREATE INDEX IF NOT EXISTS idx_clan_flow_versions_flow ON clan_flow_versions (flow_id, version DESC);
