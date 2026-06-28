import type Database from "better-sqlite3";
import type { ChangeEmitter } from "../change-inserter.js";
import { buildChangeEmitter } from "../change-inserter.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { extractWhere, type PlayerIdentity, type SpatialColumns } from "../projection-utils.js";
import { lookupCatalog, priorPointsAccount, upsertAchievement } from "./achievement-state.js";
import { lookupSpecTask, resolveAchievementSpec } from "./achievement-resolver.js";
import type { AchievementSpec } from "./achievement-types.js";
import {
    EVENT_COMBAT_ACHIEVEMENT_COMPLETED,
    EVENT_COMBAT_ACHIEVEMENTS_SNAPSHOT,
} from "../../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../../flows/registries/plugin-event-registry.js";

const ACHIEVEMENT_CHANGE_COLS = [
    "task_id",
    "task_name",
    "boss_id",
    "boss_name",
    "tier",
    "task_type",
    "points_before",
    "points_after",
];

interface EmitAchievementArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    taskId: number;
    spec: AchievementSpec;
    pointsBefore: number;
    pointsAfter: number;
}

function emitAchievementChange(args: EmitAchievementArgs): void {
    const { emitter, id, envelope, where, taskId, spec, pointsBefore, pointsAfter } = args;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "combat_achievement",
        dedupParts: [taskId, spec.points],
        specific: [
            spec.taskId,
            spec.taskName,
            spec.bossId,
            spec.bossName,
            spec.tier,
            spec.taskType,
            pointsBefore,
            pointsAfter,
        ],
    });
}

function resolvePointsBefore(conn: Database.Database, payload: Record<string, unknown>, accountHash: string): number {
    return typeof payload.pointsBefore === "number" ? payload.pointsBefore : priorPointsAccount(conn, accountHash);
}

export function handleCombatAchievement(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const taskId = typeof payload.taskId === "number" ? payload.taskId : null;
    if (taskId === null) return;
    const where = extractWhere(payload);
    const spec = resolveAchievementSpec(lookupCatalog(conn, taskId), payload, taskId);
    const pointsBefore = resolvePointsBefore(conn, payload, id.accountHash);
    const pointsAfter = pointsBefore + spec.points;
    const emitter = buildChangeEmitter(conn, "plugin_combat_achievements_changes", ACHIEVEMENT_CHANGE_COLS);
    conn.transaction(() => {
        emitAchievementChange({ emitter, id, envelope, where, taskId, spec, pointsBefore, pointsAfter });
        upsertAchievement({ conn, id, spec, now, completedAt: now });
    })();
}

export function handleSnapshot(ctx: HandlerCtx): void {
    const { conn, payload, now, id } = ctx;
    const tasks: unknown[] = Array.isArray(payload.completedTasks) ? payload.completedTasks : [];
    conn.transaction(() => {
        for (const taskId of tasks) {
            const spec = lookupSpecTask(conn, taskId);
            if (spec === null) continue;
            upsertAchievement({ conn, id, spec, now, completedAt: now });
        }
    })();
}

registerPluginEvent({
    eventType: EVENT_COMBAT_ACHIEVEMENT_COMPLETED,
    routing: "current-state",
    handler: handleCombatAchievement,
    payloadFields: [
        { name: "taskId", type: "integer" },
        { name: "pointsBefore", type: "integer" },
    ],
});

registerPluginEvent({
    eventType: EVENT_COMBAT_ACHIEVEMENTS_SNAPSHOT,
    routing: "current-state",
    handler: handleSnapshot,
    payloadFields: [{ name: "completedTasks", type: "string" }],
});
