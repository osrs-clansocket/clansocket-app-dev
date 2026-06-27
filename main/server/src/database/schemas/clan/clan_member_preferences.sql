CREATE TABLE IF NOT EXISTS clan_member_preferences (
    rsn TEXT PRIMARY KEY,
    timezone TEXT,
    quiet_hours_start INTEGER,
    quiet_hours_end INTEGER,
    channel_opt_out_json TEXT NOT NULL DEFAULT '{}',
    newsletter_opt_in_json TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clan_member_preferences_timezone ON clan_member_preferences (timezone);
