import type { ActorKind } from "./list/index.js";

export interface ClientAuditEntry {
    sessionId: string;
    seq: number;
    ts: number;
    action: string;
    target?: string | null;
    meta?: Record<string, unknown> | null;
    actor_kind?: ActorKind;
}
