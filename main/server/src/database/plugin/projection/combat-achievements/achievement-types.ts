import type Database from "better-sqlite3";
import type { PlayerIdentity } from "../projection-utils.js";

export interface CatalogRow {
    task_name: string;
    boss_id: number | null;
    boss_name: string | null;
    tier: string;
    task_type: string | null;
    points: number;
}

export interface AchievementSpec {
    taskId: number;
    taskName: string;
    bossId: number | null;
    bossName: string | null;
    tier: string;
    taskType: string | null;
    points: number;
}

export function achievementSpec(
    taskId: number,
    taskName: string,
    bossId: number | null,
    bossName: string | null,
    tier: string,
    taskType: string | null,
    points: number,
): AchievementSpec {
    return { taskId, taskName, bossId, bossName, tier, taskType, points };
}

export interface UpsertAchievementArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    spec: AchievementSpec;
    completedAt: number;
    now: number;
}
