import { runSaturate } from "./saturate-runner.js";

export interface WomStatRow {
    accountHash: string;
    rsn: string;
    skill: string;
    level: number;
    experience: number;
    lastChangedAtMs: number;
}

export function womStatRow(
    accountHash: string,
    rsn: string,
    skill: string,
    level: number,
    experience: number,
    lastChangedAtMs: number,
): WomStatRow {
    return { accountHash, rsn, skill, level, experience, lastChangedAtMs };
}

const WOM_TO_PLUGIN_SKILL_ALIAS: Record<string, string> = {
    runecrafting: "runecraft",
};

function normalizeSkill(skill: string): string {
    const lower = skill.trim().toLowerCase();
    return WOM_TO_PLUGIN_SKILL_ALIAS[lower] ?? lower;
}

const UPSERT_SQL = `INSERT INTO plugin_stats (
    account_hash, rsn, skill,
    level, level_source, level_updated_at,
    boosted,
    xp, xp_source, xp_updated_at,
    first_seen, last_seen, updated_at
) VALUES ($accountHash, $rsn, $skill, $level, 'wom', $changedAt, 0, $xp, 'wom', $changedAt, $now, $now, $now)
ON CONFLICT(account_hash, skill) DO UPDATE SET
    rsn = excluded.rsn,
    level = CASE
        WHEN plugin_stats.level_updated_at IS NOT NULL
            AND plugin_stats.level_updated_at >= excluded.level_updated_at
        THEN plugin_stats.level
        ELSE MAX(plugin_stats.level, excluded.level)
    END,
    level_source = CASE
        WHEN plugin_stats.level_updated_at IS NOT NULL
            AND plugin_stats.level_updated_at >= excluded.level_updated_at
        THEN COALESCE(plugin_stats.level_source, 'plugin')
        WHEN excluded.level > plugin_stats.level
        THEN 'wom'
        ELSE COALESCE(plugin_stats.level_source, 'plugin')
    END,
    level_updated_at = CASE
        WHEN plugin_stats.level_updated_at IS NOT NULL
            AND plugin_stats.level_updated_at >= excluded.level_updated_at
        THEN plugin_stats.level_updated_at
        WHEN excluded.level > plugin_stats.level
        THEN excluded.level_updated_at
        ELSE plugin_stats.level_updated_at
    END,
    xp = CASE
        WHEN plugin_stats.xp_updated_at IS NOT NULL
            AND plugin_stats.xp_updated_at >= excluded.xp_updated_at
        THEN plugin_stats.xp
        ELSE MAX(plugin_stats.xp, excluded.xp)
    END,
    xp_source = CASE
        WHEN plugin_stats.xp_updated_at IS NOT NULL
            AND plugin_stats.xp_updated_at >= excluded.xp_updated_at
        THEN COALESCE(plugin_stats.xp_source, 'plugin')
        WHEN excluded.xp > plugin_stats.xp
        THEN 'wom'
        ELSE COALESCE(plugin_stats.xp_source, 'plugin')
    END,
    xp_updated_at = CASE
        WHEN plugin_stats.xp_updated_at IS NOT NULL
            AND plugin_stats.xp_updated_at >= excluded.xp_updated_at
        THEN plugin_stats.xp_updated_at
        WHEN excluded.xp > plugin_stats.xp
        THEN excluded.xp_updated_at
        ELSE plugin_stats.xp_updated_at
    END,
    last_seen = excluded.last_seen,
    updated_at = excluded.updated_at`;

export function saturateStatsWom(clanId: string, mode: string, rows: readonly WomStatRow[]): number {
    return runSaturate({
        clanId,
        mode,
        rows,
        sql: UPSERT_SQL,
        label: "stats",
        mapRow: (row, now) => ({
            accountHash: row.accountHash,
            rsn: row.rsn,
            skill: normalizeSkill(row.skill),
            level: row.level,
            xp: row.experience,
            changedAt: row.lastChangedAtMs > 0 ? row.lastChangedAtMs : now,
            now,
        }),
    });
}
