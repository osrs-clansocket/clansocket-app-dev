import { isPlainObject } from "../../shared/validators/type-guards.js";
import { EVENT_BATCH, EVENT_IDENTITY } from "../event-types.js";
import { logPluginEvent } from "../logger/index.js";
import { send } from "../transport/send.js";
import type { PluginSocketState } from "../session/socket-state.js";
import type { PluginClientMessage } from "../types/index.js";
import type { BatchContext, DispatchContext } from "./dispatch-types.js";

type BatchMsg = Extract<PluginClientMessage, { type: "batch" }>;

function resolveBatchContext(state: PluginSocketState, msg: BatchMsg): BatchContext | null {
    if (typeof msg.seq === "number" && msg.seq > 0 && msg.seq <= state.lastBatchSeq) return null;
    if (typeof msg.seq === "number" && msg.seq > 0) state.lastBatchSeq = msg.seq;
    const batchSeq = typeof msg.seq === "number" ? msg.seq : state.lastBatchSeq;
    const tick = (msg as { tick?: unknown }).tick;
    return { batchSeq, batchTick: typeof tick === "number" ? tick : null };
}

function orderBatchEvents(events: unknown[]): unknown[] {
    return [...events].sort((a, b) => {
        const at = (a as { type?: unknown })?.type === EVENT_IDENTITY ? 0 : 1;
        const bt = (b as { type?: unknown })?.type === EVENT_IDENTITY ? 0 : 1;
        return at - bt;
    });
}

function isDispatchableChild(child: unknown): child is PluginClientMessage {
    return isPlainObject(child) && typeof child.type === "string";
}

export function dispatchBatch(
    ctx: DispatchContext,
    msg: BatchMsg,
    dispatchOne: (ctx: DispatchContext, msg: PluginClientMessage, batchCtx?: BatchContext) => void,
): void {
    const { ws, state, sessionId } = ctx;
    if (state.authed) logPluginEvent(sessionId, EVENT_BATCH, msg);
    if (!Array.isArray(msg.events)) return;
    const batchCtx = resolveBatchContext(state, msg);
    if (!batchCtx) return;
    const ordered = orderBatchEvents(msg.events);
    for (const child of ordered) {
        if (!isDispatchableChild(child)) continue;
        if (!state.bucket.tryConsume()) {
            send(ws, { type: "error", reason: "rate limit" });
            return;
        }
        dispatchOne(ctx, child, batchCtx);
    }
}
