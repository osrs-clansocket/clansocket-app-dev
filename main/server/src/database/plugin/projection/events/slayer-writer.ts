import type Database from "better-sqlite3";
import type { PlayerIdentity } from "../projection-utils.js";

export interface SlayerFacts {
    targetId: number | null;
    targetName: string | null;
    areaId: number | null;
    areaName: string | null;
    masterId: number | null;
    masterName: string | null;
    points: number;
    tasksCompleted: number;
    bossId: number | null;
    bossName: string | null;
    count: number | null;
    countOriginal: number | null;
    wildyTasksCompleted: number;
}

const SLAYER_UPSERT_SQL = `INSERT INTO plugin_slayer
    (account_hash, rsn, target_id, target_name,
     area_id, area_name, master_id, master_name, points, tasks_completed,
     boss_id, boss_name, count, count_original, wildy_tasks_completed, first_seen, last_seen, updated_at)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
 ON CONFLICT (account_hash) DO UPDATE SET
    rsn = excluded.rsn,
    target_id = excluded.target_id,
    target_name = excluded.target_name,
    area_id = excluded.area_id,
    area_name = excluded.area_name,
    master_id = excluded.master_id,
    master_name = excluded.master_name,
    points = excluded.points,
    tasks_completed = excluded.tasks_completed,
    boss_id = excluded.boss_id,
    boss_name = excluded.boss_name,
    count = excluded.count,
    count_original = excluded.count_original,
    wildy_tasks_completed = excluded.wildy_tasks_completed,
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN target_id IS NOT excluded.target_id
          OR count IS NOT excluded.count
          OR points != excluded.points
          OR tasks_completed != excluded.tasks_completed
        THEN excluded.updated_at
        ELSE updated_at
    END`;

export function upsertSlayer(conn: Database.Database, id: PlayerIdentity, facts: SlayerFacts, now: number): void {
    conn.prepare(SLAYER_UPSERT_SQL).run(
        id.accountHash,
        id.rsn ?? "",
        facts.targetId,
        facts.targetName,
        facts.areaId,
        facts.areaName,
        facts.masterId,
        facts.masterName,
        facts.points,
        facts.tasksCompleted,
        facts.bossId,
        facts.bossName,
        facts.count,
        facts.countOriginal,
        facts.wildyTasksCompleted,
        now,
        now,
        now,
    );
}
