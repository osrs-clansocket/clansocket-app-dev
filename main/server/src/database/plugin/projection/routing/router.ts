import { clanPluginDb } from "../../../core/database.js";
import { lookupRsnHash } from "../../rsn-lookup.js";
import { dispatchSafe } from "../auto-hook-dispatcher.js";
import { buildEventEnvelope, type EnvelopeContext } from "../envelope.js";
import { BUCKET_MS, type Payload } from "../projection-utils.js";
import { BUCKET_ROUTES } from "./route-buckets.js";
import { CURRENT_STATE_ROUTES } from "./route-current-state.js";
import { EVENT_ROUTES } from "./route-events.js";

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
    const csHandler = CURRENT_STATE_ROUTES[ctx.eventType];
    if (!csHandler) return false;
    const envelopeCtx: EnvelopeContext = {
        batchSeq: ctx.batchCtx.batchSeq,
        batchTick: ctx.batchCtx.batchTick,
        sessionId: ctx.sessionId,
        accountHash: ctx.accountHash,
        eventType: ctx.eventType,
    };
    const envelope = buildEventEnvelope(ctx.conn, envelopeCtx, ctx.payload);
    csHandler({
        envelope,
        conn: ctx.conn,
        payload: ctx.payload,
        now: ctx.now,
        id: { accountHash: ctx.accountHash, rsn: ctx.rsn },
    });
    return true;
}

function dispatchFlat(ctx: DispatchCtx): void {
    const evHandler = EVENT_ROUTES[ctx.eventType];
    if (evHandler) {
        evHandler(ctx.conn, ctx.accountHash, ctx.rsn, ctx.payload, ctx.now);
        return;
    }
    const buHandler = BUCKET_ROUTES[ctx.eventType];
    if (buHandler) {
        buHandler(ctx.conn, ctx.accountHash, ctx.rsn, ctx.payload, Math.floor(ctx.now / BUCKET_MS));
    }
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
