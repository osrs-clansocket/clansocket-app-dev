import { routePluginEvent } from "../../../database/index.js";
import { isNumber } from "../../../shared/validators/type-guards.js";
import {
    EVENT_BANK_CLOSE,
    EVENT_BANK_OPEN,
    EVENT_BOOSTS,
    EVENT_CLUE_COMPLETED,
    EVENT_CLUE_OPENED,
    EVENT_COLLECTION_LOG_ENTRY,
    EVENT_COLLECTION_LOG_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENTS_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENT_COMPLETED,
    EVENT_CONTAINER,
    EVENT_CONTAINER_DELTA,
    EVENT_DAMAGE_DEALT,
    EVENT_DAMAGE_TAKEN,
    EVENT_DEATH,
    EVENT_DIARIES,
    EVENT_DIARY_COMPLETED,
    EVENT_FARMING_PATCH,
    EVENT_INTERACTING,
    EVENT_LEVEL_UP,
    EVENT_LOCATION,
    EVENT_LOOT,
    EVENT_MENU_ACTION,
    EVENT_PET_DROP,
    EVENT_PRAYERS,
    EVENT_QUESTS,
    EVENT_QUEST_COMPLETED,
    EVENT_RUNE_POUCH,
    EVENT_SLAYER,
    EVENT_STATS,
    EVENT_STATUS_EFFECT,
    EVENT_VITALS,
    EVENT_WORLD_HOP,
    EVENT_XP_GAINED,
} from "../../event-types.js";

import { logPluginEvent } from "../../logger/index.js";
import { checkTelemetryGate, handleTelemetryReject } from "../../session/telemetry-gate.js";
import type { PluginClientMessage } from "../../types/index.js";
import type { BatchContext, DispatchContext } from "../dispatch.js";

export const STANDARD_TELEMETRY_EVENTS: readonly string[] = [
    EVENT_XP_GAINED,
    EVENT_LEVEL_UP,
    EVENT_DEATH,
    EVENT_LOCATION,
    EVENT_VITALS,
    EVENT_PRAYERS,
    EVENT_STATUS_EFFECT,
    EVENT_INTERACTING,
    EVENT_CONTAINER,
    EVENT_CONTAINER_DELTA,
    EVENT_WORLD_HOP,
    EVENT_MENU_ACTION,
    EVENT_STATS,
    EVENT_BANK_OPEN,
    EVENT_BANK_CLOSE,
    EVENT_DAMAGE_DEALT,
    EVENT_DAMAGE_TAKEN,
    EVENT_LOOT,
    EVENT_PET_DROP,
    EVENT_BOOSTS,
    EVENT_SLAYER,
    EVENT_RUNE_POUCH,
    EVENT_QUESTS,
    EVENT_QUEST_COMPLETED,
    EVENT_DIARIES,
    EVENT_DIARY_COMPLETED,
    EVENT_CLUE_COMPLETED,
    EVENT_CLUE_OPENED,
    EVENT_COLLECTION_LOG_ENTRY,
    EVENT_COLLECTION_LOG_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENTS_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENT_COMPLETED,
    EVENT_FARMING_PATCH,
];

import { isDuplicateSnapshot } from "./snapshot-dedup.js";

function resolveBatchCtx(
    state: DispatchContext["state"],
    msg: PluginClientMessage,
    batchCtx?: BatchContext,
): BatchContext {
    return (
        batchCtx ?? {
            batchSeq: state.lastBatchSeq,
            batchTick: isNumber((msg as { tick?: unknown }).tick) ? (msg as { tick: number }).tick : null,
        }
    );
}

export function handleStandardTelemetry(ctx: DispatchContext, msg: PluginClientMessage, batchCtx?: BatchContext): void {
    const { ws, state, sessionId } = ctx;
    const gate = checkTelemetryGate(state, Date.now());
    if (!gate.ok) {
        handleTelemetryReject(ws, state, gate.reason);
        return;
    }
    if (isDuplicateSnapshot(state, msg)) return;
    if (msg.type === EVENT_WORLD_HOP) state.currentWorld = (msg as { toWorld: number }).toWorld;
    routePluginEvent({
        sessionId,
        clanId: state.sockClanId!,
        mode: state.sockMode!,
        accountHash: state.sessionAccount!,
        eventType: msg.type,
        payload: msg,
        batchCtx: resolveBatchCtx(state, msg, batchCtx),
    });
    logPluginEvent(sessionId, msg.type, msg);
}
