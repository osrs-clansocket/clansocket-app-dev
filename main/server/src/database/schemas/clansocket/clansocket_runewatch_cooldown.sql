-- clansocket_runewatch_cooldown — singleton-row cooldown for runewatch.com mixedlist fetches
--
-- Mirrors the clan_wom_rate_window pattern: one row per database, throttle outbound HTTPS fetches.
-- 5-minute cooldown between fetches to avoid hammering raw.githubusercontent.com.
-- Sync orchestrator at runewatch/sync/sync-runewatch-cases.ts reads + writes this row.

CREATE TABLE IF NOT EXISTS clansocket_runewatch_cooldown (
    singleton_key TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    last_fetch_at INTEGER NOT NULL DEFAULT 0,
    last_fetch_status TEXT NOT NULL DEFAULT 'ok',
    last_case_count INTEGER NOT NULL DEFAULT 0,
    last_hard_count INTEGER NOT NULL DEFAULT 0,
    last_soft_count INTEGER NOT NULL DEFAULT 0,
    last_inserted INTEGER NOT NULL DEFAULT 0,
    last_updated INTEGER NOT NULL DEFAULT 0,
    last_deleted INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    CHECK (singleton_key = 'default'),
    CHECK (last_fetch_status IN ('ok', 'http_error', 'parse_error'))
);

CREATE TRIGGER IF NOT EXISTS clansocket_runewatch_cooldown_updated_at
AFTER UPDATE ON clansocket_runewatch_cooldown
BEGIN
    UPDATE clansocket_runewatch_cooldown
    SET updated_at = (STRFTIME('%s', 'now') * 1000)
    WHERE singleton_key = new.singleton_key;
END;
