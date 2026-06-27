CREATE TABLE IF NOT EXISTS clan_member_tags (
    rsn TEXT NOT NULL,
    tag_key TEXT NOT NULL,
    tag_value TEXT,
    set_at INTEGER NOT NULL,
    set_by_flow_id TEXT,
    PRIMARY KEY (rsn, tag_key)
);

CREATE INDEX IF NOT EXISTS idx_clan_member_tags_rsn ON clan_member_tags (rsn);

CREATE INDEX IF NOT EXISTS idx_clan_member_tags_key ON clan_member_tags (tag_key);
