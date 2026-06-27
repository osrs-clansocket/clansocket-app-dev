CREATE TABLE IF NOT EXISTS clan_ui_components (
    component_id TEXT PRIMARY KEY,
    component_name TEXT NOT NULL,
    canvas_x INTEGER NOT NULL,
    canvas_y INTEGER NOT NULL,
    canvas_w INTEGER NOT NULL,
    canvas_h INTEGER NOT NULL,
    z_index INTEGER NOT NULL DEFAULT 0,
    payload_json TEXT NOT NULL,
    token_overrides_json TEXT NOT NULL DEFAULT '{}',
    parent_id TEXT,
    account_hash TEXT,
    rsn TEXT,
    event_received_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clan_ui_components_z ON clan_ui_components(z_index);

CREATE INDEX IF NOT EXISTS idx_clan_ui_components_parent ON clan_ui_components(parent_id);
