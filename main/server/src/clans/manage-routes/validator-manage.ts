import type { ClientAuditEntry } from "../../database/index.js";
import { asFiniteNumber, asObject } from "../../shared/coerce.js";
import { readEntryField, readMeta, readSeq, readSessionId } from "./validator-entry-fields.js";

export function validateClientEntry(raw: unknown): ClientAuditEntry | null {
    const e = asObject(raw);
    if (e === null) return null;
    const sessionId = readSessionId(e.sessionId);
    if (sessionId === null) return null;
    const seq = readSeq(e.seq);
    if (seq === null) return null;
    const ts = asFiniteNumber(e.ts);
    if (ts === null) return null;
    const action = readEntryField(e.action);
    if (action === null) return null;
    const meta = readMeta(e.meta);
    if (meta === false) return null;
    const out: ClientAuditEntry = { sessionId, seq, ts, action, meta, target: readEntryField(e.target) };
    if (e.actor_kind === "ai") out.actor_kind = "ai";
    return out;
}
