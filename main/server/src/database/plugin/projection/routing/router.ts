import { clanPluginDb } from "../../../core/database.js";
import { lookupRsnHash } from "../../rsn-lookup.js";
import { dispatchSafe } from "../auto-hook-dispatcher.js";
import { buildEventEnvelope, type EnvelopeContext } from "../envelope.js";
import { BUCKET_MS, type Payload } from "../projection-utils.js";
import {
    dispatchBucketHandler,
    dispatchCurrentStateHandler,
    dispatchEventHandler,
} from "../../../../flows/registries/plugin-event-registry.js";

export interface BatchEnvelopeCtx {
    batchSeq: number;
    batchTick: number | null;
}

export interface RouteEventArgs {
    clanId: string;
    mode: string;
    sessionId: string;
    accountHash: string;
    eventType: string;
    payload: Payload;
    batchCtx: BatchEnvelopeCtx;
}

interface DispatchCtx {
    conn: ReturnType<typeof clanPluginDb>;
    accountHash: string;
    rsn: string | null;
    eventType: string;
    payload: Payload;
    now: number;
    sessionId: string;
    batchCtx: BatchEnvelopeCtx;
}

function dispatchCurrentState(ctx: DispatchCtx): boolean {
    const envelopeCtx: EnvelopeContext = {
        batchSeq: ctx.batchCtx.batchSeq,
        batchTick: ctx.batchCtx.batchTick,
        sessionId: ctx.sessionId,
        accountHash: ctx.accountHash,
        eventType: ctx.eventType,
    };
    const envelope = buildEventEnvelope(ctx.conn, envelopeCtx, ctx.payload);
    return dispatchCurrentStateHandler(ctx.eventType, {
        envelope,
        conn: ctx.conn,
        payload: ctx.payload,
        now: ctx.now,
        id: { accountHash: ctx.accountHash, rsn: ctx.rsn },
    });
}

function dispatchFlat(ctx: DispatchCtx): void {
    if (dispatchEventHandler(ctx.eventType, ctx.conn, ctx.accountHash, ctx.rsn, ctx.payload, ctx.now)) return;
    dispatchBucketHandler(
        ctx.eventType,
        ctx.conn,
        ctx.accountHash,
        ctx.rsn,
        ctx.payload,
        Math.floor(ctx.now / BUCKET_MS),
    );
}

export function routePluginEvent(args: RouteEventArgs): void {
    const { clanId, mode, sessionId, accountHash, eventType, payload, batchCtx } = args;
    const conn = clanPluginDb(clanId, mode);
    const rsn = lookupRsnHash(clanId, accountHash);
    const now = Date.now();
    dispatchSafe({ triggerType: eventType, payload: payload as object, clanId, rsn });
    const ctx: DispatchCtx = { conn, accountHash, rsn, eventType, payload, now, sessionId, batchCtx };
    if (dispatchCurrentState(ctx)) return;
    dispatchFlat(ctx);
}
