import logger from "@clansocket/logger";
import { clanPluginDb } from "../../../core/database.js";

export interface CatalogEntry {
    taskId: number;
    name: string;
    description: string;
    tier: string;
    taskType: string;
    points: number;
    bossId: number;
    bossName: string;
}

export function upsertCatalog(clanId: string, mode: string, entries: CatalogEntry[]): number {
    const conn = clanPluginDb(clanId, mode);
    const stmt = conn.prepare(
        `INSERT OR REPLACE INTO plugin_combat_achievement_catalog
            (task_id, task_name, description, tier, task_type, points, boss_id, boss_name, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const now = Date.now();
    let count = 0;
    conn.transaction(() => {
        logger.debug(`[ca-catalog] upsertCatalog clanId=${clanId} mode=${mode} entries=${entries.length}`);
        for (const e of entries) {
            stmt.run(e.taskId, e.name, e.description, e.tier, e.taskType, e.points, e.bossId, e.bossName, now);
            count++;
        }
    })();
    return count;
}
