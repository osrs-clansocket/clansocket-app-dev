import type Database from "better-sqlite3";
import { getOne } from "../../../core/db-ops.js";
import { execMutation } from "../../../core/db-mutations.js";

import type { PlayerIdentity } from "../projection-utils.js";
import type { PriorStat, StatRow } from "./stat-types.js";

const PRIOR_STAT_SQL = `SELECT level, xp FROM plugin_stats WHERE account_hash = ? AND skill = ?`;

export function normalizeSkill(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed.length === 0 ? null : trimmed.toLowerCase();
}

export function readPriorStat(conn: Database.Database, accountHash: string, skill: string): PriorStat | null {
    return getOne<PriorStat>(conn, PRIOR_STAT_SQL, accountHash, skill);
}

const STAT_UPSERT_SQL = `INSERT INTO plugin_stats (
    account_hash, rsn, skill,
    level, level_source, level_updated_at,
    boosted,
    xp, xp_source, xp_updated_at,
    first_seen, last_seen, updated_at
 ) VALUES ($accountHash, $rsn, $skill, $level, 'plugin', $now, $boosted, $xp, 'plugin', $now, $now, $now, $now)
 ON CONFLICT (account_hash, skill) DO UPDATE SET
    rsn = excluded.rsn,
    level = excluded.level,
    level_source = 'plugin',
    level_updated_at = excluded.level_updated_at,
    boosted = excluded.boosted,
    xp = excluded.xp,
    xp_source = 'plugin',
    xp_updated_at = excluded.xp_updated_at,
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN level != excluded.level OR boosted != excluded.boosted OR xp != excluded.xp
        THEN excluded.updated_at
        ELSE updated_at
    END`;

export function upsertStat(conn: Database.Database, id: PlayerIdentity, stat: StatRow, now: number): void {
    execMutation(conn, STAT_UPSERT_SQL, {
        now,
        rsn: id.rsn ?? "",
        accountHash: id.accountHash,
        skill: stat.skill,
        level: stat.level,
        boosted: stat.boosted,
        xp: stat.xp,
    });
}
