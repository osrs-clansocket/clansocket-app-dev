import { setCorrelationId } from "../identity/identity-client/index.js";
import { CAUSAL_ACTIONS, COLLAPSE_MS, MAX_AGE_MS, MAX_BATCH, type BufferEntry } from "./audit-client-config.js";
import { getBuffer, getCurrentSlug, nextSeq, sessionId } from "./audit-client-state.js";
import { flush } from "./audit-client-flush.js";

function collapseLast(last: BufferEntry, action: string): boolean {
    const prevCount = typeof last.meta?.count === "number" ? last.meta.count : 1;
    last.meta = { ...(last.meta ?? {}), count: prevCount + 1 };
    if (CAUSAL_ACTIONS.has(action)) setCorrelationId(`${sessionId}.${last.seq}`);
    return true;
}

function shouldCollapse(
    last: BufferEntry | undefined,
    action: string,
    target: string | null,
    actorKind?: "ai",
): last is BufferEntry {
    if (!last) return false;
    if (last.action !== action) return false;
    if (last.target !== target) return false;
    if (last.actor_kind !== actorKind) return false;
    return Date.now() - last.ts < COLLAPSE_MS;
}

export function push(
    action: string,
    target: string | null,
    meta: Record<string, unknown> | null = null,
    actorKind?: "ai",
): void {
    if (getCurrentSlug() === null) return;
    const buffer = getBuffer();
    const last = buffer[buffer.length - 1];
    if (shouldCollapse(last, action, target, actorKind)) {
        collapseLast(last, action);
        return;
    }
    const currentSeq = nextSeq();
    const entry: BufferEntry = { sessionId, action, target, meta, seq: currentSeq, ts: Date.now() };
    if (actorKind) entry.actor_kind = actorKind;
    buffer.push(entry);
    if (CAUSAL_ACTIONS.has(action)) setCorrelationId(`${sessionId}.${entry.seq}`);
    if (buffer.length >= MAX_BATCH || Date.now() - buffer[0]!.ts >= MAX_AGE_MS) void flush();
}
