import type Database from "better-sqlite3";
import { getOne } from "../../../core/db-ops.js";
import {
    achievementSpec,
    type AchievementSpec,
    type CatalogRow,
    type UpsertAchievementArgs,
} from "./achievement-types.js";

const LOOKUP_SQL = `SELECT task_name, boss_id, boss_name, tier, task_type, points
             FROM plugin_combat_achievement_catalog WHERE task_id = ?`;

const PRIOR_POINTS_SQL = `SELECT COALESCE(SUM(points), 0) AS total FROM plugin_combat_achievements WHERE account_hash = ?`;

export function lookupCatalog(conn: Database.Database, taskId: number): CatalogRow | null {
    return getOne<CatalogRow>(conn, LOOKUP_SQL, taskId);
}

export function priorPointsAccount(conn: Database.Database, accountHash: string): number {
    const row = getOne<{ total: number }>(conn, PRIOR_POINTS_SQL, accountHash);
    return row?.total ?? 0;
}

export function specFromCatalog(taskId: number, catalog: CatalogRow): AchievementSpec {
    return achievementSpec(
        taskId,
        catalog.task_name,
        catalog.boss_id,
        catalog.boss_name,
        catalog.tier,
        catalog.task_type,
        catalog.points,
    );
}

const ACHIEVEMENT_UPSERT_SQL = `INSERT INTO plugin_combat_achievements
    (account_hash, rsn, task_id, task_name, boss_id, boss_name, tier, task_type, points, completed_at, first_seen, last_seen, updated_at)
 VALUES ($accountHash, $rsn, $taskId, $taskName, $bossId, $bossName, $tier, $taskType, $points, $completedAt, $now, $now, $now)
 ON CONFLICT (account_hash, task_id) DO UPDATE SET
    rsn = excluded.rsn,
    task_name = excluded.task_name,
    boss_id = excluded.boss_id,
    boss_name = excluded.boss_name,
    tier = excluded.tier,
    task_type = excluded.task_type,
    points = excluded.points,
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN task_name != excluded.task_name OR tier != excluded.tier OR points != excluded.points
        THEN excluded.updated_at
        ELSE updated_at
    END`;

export function upsertAchievement(args: UpsertAchievementArgs): void {
    const { conn, id, spec, completedAt, now } = args;
    conn.prepare(ACHIEVEMENT_UPSERT_SQL).run({
        completedAt,
        now,
        rsn: id.rsn ?? "",
        accountHash: id.accountHash,
        taskId: spec.taskId,
        taskName: spec.taskName,
        bossId: spec.bossId,
        bossName: spec.bossName,
        tier: spec.tier,
        taskType: spec.taskType,
        points: spec.points,
    });
}
