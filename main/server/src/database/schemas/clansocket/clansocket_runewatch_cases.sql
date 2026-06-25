-- clansocket_runewatch_cases — mirror of runewatch.com cases (hard + soft tiers)
--
-- Source-of-truth mirror of:
--   https://raw.githubusercontent.com/while-loop/runelite-plugins/runewatch-updater/mixedlist.json
-- Full-replace sync on each fetch — anything missing from upstream gets deleted (auto-rehab path).
-- HARD rows (source = 'RW') have hash + published_at + evidence_rating + quick_find populated.
-- SOFT rows (source = 'WDR') have only accused_rsn + reason + source — community submissions, unvetted.
-- Single gate chokepoint at runewatch/gates/check-runewatch-block-gate.ts. Only hard tier blocks.

CREATE TABLE IF NOT EXISTS clansocket_runewatch_cases (
    case_key TEXT NOT NULL PRIMARY KEY,
    hash TEXT,
    tier TEXT NOT NULL,
    accused_rsn TEXT NOT NULL,
    rsn_normalized TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence_rating INTEGER,
    source TEXT NOT NULL,
    quick_find TEXT,
    published_at INTEGER,
    synced_at INTEGER NOT NULL,
    CHECK (tier IN ('hard', 'soft')),
    CHECK (source IN ('RW', 'WDR')),
    CHECK (
        (tier = 'hard' AND hash IS NOT NULL AND evidence_rating IS NOT NULL AND published_at IS NOT NULL)
        OR (tier = 'soft' AND hash IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_runewatch_cases_rsn_norm ON clansocket_runewatch_cases (rsn_normalized);
CREATE INDEX IF NOT EXISTS idx_runewatch_cases_tier ON clansocket_runewatch_cases (tier);
CREATE INDEX IF NOT EXISTS idx_runewatch_cases_source ON clansocket_runewatch_cases (source);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_runewatch_cases_hash ON clansocket_runewatch_cases (hash)
WHERE hash IS NOT NULL;
