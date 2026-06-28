import { routePluginEvent } from "../../../database/index.js";
import { isNumber } from "../../../shared/validators/type-guards.js";
import { EVENT_WORLD_HOP } from "../../event-types.js";
import { logPluginEvent } from "../../logger/index.js";
import { checkTelemetryGate, handleTelemetryReject } from "../../session/telemetry-gate.js";
import type { PluginClientMessage } from "../../types/index.js";
import type { BatchContext, DispatchContext } from "../dispatch-types.js";
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
