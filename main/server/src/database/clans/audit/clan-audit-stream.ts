import { scopedEmitterRegistry } from "../../../shared/events/scoped-emitter-registry.js";
import type { ClanAuditEntry } from "./clan-audit/list/index.js";

const MAX_AUDIT_STREAM_LISTENERS = 64;
const REGISTRY = scopedEmitterRegistry<ClanAuditEntry>({
    eventName: "audit",
    maxListeners: MAX_AUDIT_STREAM_LISTENERS,
});

export type AuditStreamHandler = (entry: ClanAuditEntry) => void;

export function broadcastAuditEntry(clanId: string, entry: ClanAuditEntry): void {
    REGISTRY.broadcast(clanId, entry);
}

export function registerAuditListener(clanId: string, handler: AuditStreamHandler): () => void {
    return REGISTRY.registerListener(clanId, handler);
}
