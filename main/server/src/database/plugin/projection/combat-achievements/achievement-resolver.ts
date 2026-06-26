import type Database from "better-sqlite3";
import { asNumberNullable, asStringNullable } from "../projection-utils.js";
import { lookupCatalog, specFromCatalog } from "./achievement-state.js";
import { achievementSpec, type AchievementSpec, type CatalogRow } from "./achievement-types.js";

export function resolveAchievementSpec(
    catalog: CatalogRow | null,
    payload: Record<string, unknown>,
    taskId: number,
): AchievementSpec {
    return achievementSpec({
        taskId,
        taskName: catalog?.task_name ?? asStringNullable(payload.name) ?? "",
        bossId: catalog?.boss_id ?? asNumberNullable(payload.bossId),
        bossName: catalog?.boss_name ?? asStringNullable(payload.bossName),
        tier: catalog?.tier ?? asStringNullable(payload.tier) ?? "",
        taskType: catalog?.task_type ?? asStringNullable(payload.taskType),
        points: asNumberNullable(payload.points) ?? catalog?.points ?? 0,
    });
}

export function lookupSpecTask(conn: Database.Database, taskId: unknown): AchievementSpec | null {
    const id = asNumberNullable(taskId);
    if (id === null) return null;
    const catalog = lookupCatalog(conn, id);
    if (catalog === null) return null;
    return specFromCatalog(id, catalog);
}
