import type Database from "better-sqlite3";
import { getOne } from "../../../core/db-ops.js";
import { buildChangeEmitter } from "../change-inserter.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { HandlerCtx } from "../handler-ctx.js";
import {
    asNumber,
    asNumberNullable,
    asStringNullable,
    extractWhere,
    type PlayerIdentity,
    type Payload,
    type SpatialColumns,
} from "../projection-utils.js";
import { upsertSlayer, type SlayerFacts } from "./slayer-writer.js";
import { EVENT_SLAYER } from "../../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../../flows/registries/plugin-event-registry.js";

interface PriorSlayer {
    target_id: number | null;
    count: number | null;
}

function readPriorSlayer(conn: Database.Database, accountHash: string): PriorSlayer | null {
    return getOne<PriorSlayer>(conn, "SELECT target_id, count FROM plugin_slayer WHERE account_hash = ?", accountHash);
}

function extractSlayerFacts(payload: Payload): SlayerFacts {
    return {
        targetId: asNumberNullable(payload.target),
        targetName: asStringNullable(payload.targetName),
        areaId: asNumberNullable(payload.area),
        areaName: asStringNullable(payload.areaName),
        masterId: asNumberNullable(payload.master),
        masterName: asStringNullable(payload.masterName),
        points: asNumber(payload.points, 0),
        tasksCompleted: asNumber(payload.tasksCompleted, 0),
        bossId: asNumberNullable(payload.bossId),
        bossName: asStringNullable(payload.bossName),
        count: asNumberNullable(payload.count),
        countOriginal: asNumberNullable(payload.countOriginal),
        wildyTasksCompleted: asNumber(payload.wildyTasksCompleted, 0),
    };
}

interface SlayerChangeArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    targetId: number;
    targetName: string;
    countBefore: number;
    count: number;
}

function emitSlayerChange(args: SlayerChangeArgs): void {
    const { conn, id, envelope, where, targetId, targetName, countBefore, count } = args;
    buildChangeEmitter(conn, "plugin_slayer_changes", [
        "target_id",
        "target_name",
        "count_remaining_before",
        "count_remaining_after",
    ]).emit({
        id,
        envelope,
        where,
        dedupKind: "slayer_change",
        dedupParts: [targetId, countBefore, count],
        specific: [targetId, targetName, countBefore, count],
    });
}

interface MaybeEmitArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    prior: PriorSlayer | null;
    facts: SlayerFacts;
}

function maybeEmitChange(args: MaybeEmitArgs): void {
    const { conn, id, envelope, where, prior, facts } = args;
    const isSameTask = prior !== null && prior.target_id === facts.targetId;
    const countChanged = prior !== null && isSameTask && prior.count !== facts.count;
    if (!countChanged || facts.targetId === null || facts.targetName === null || facts.count === null) return;
    const countBefore = prior?.count ?? facts.count;
    emitSlayerChange({
        conn,
        id,
        envelope,
        where,
        countBefore,
        targetId: facts.targetId,
        targetName: facts.targetName,
        count: facts.count,
    });
}

export function handleSlayer(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const facts = extractSlayerFacts(payload);
    const where = extractWhere(payload);
    conn.transaction(() => {
        const prior = readPriorSlayer(conn, id.accountHash);
        maybeEmitChange({ conn, id, envelope, where, prior, facts });
        upsertSlayer(conn, id, facts, now);
    })();
}

registerPluginEvent({
    eventType: EVENT_SLAYER,
    routing: "current-state",
    handler: handleSlayer,
    payloadFields: [
        { name: "target", type: "integer" },
        { name: "targetName", type: "string", sqlTable: "plugin_slayer", sqlColumn: "target_name" },
        { name: "slayerAreaId", type: "integer" },
        { name: "areaName", type: "string", sqlTable: "plugin_slayer", sqlColumn: "area_name" },
        { name: "master", type: "integer" },
        { name: "masterName", type: "string", sqlTable: "plugin_slayer", sqlColumn: "master_name" },
        { name: "points", type: "integer" },
        { name: "tasksCompleted", type: "integer" },
        { name: "bossId", type: "integer" },
        { name: "bossName", type: "osrs-boss", valueSourceRef: "osrs-boss" },
        { name: "count", type: "integer" },
    ],
});
