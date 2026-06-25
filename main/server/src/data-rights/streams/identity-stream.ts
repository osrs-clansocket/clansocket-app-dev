import { scopedEmitterRegistry } from "../../shared/events/scoped-emitter-registry.js";

export type EventKind =
    | "created"
    | "cancelled"
    | "confirmed"
    | "rejected"
    | "displaced"
    | "removed"
    | "claim_consent_created"
    | "claim_consent_resolved";

export type IdentityStreamEvent = { kind: EventKind };
export type IdentityStreamHandler = (event: IdentityStreamEvent) => void;

const REGISTRY = scopedEmitterRegistry<IdentityStreamEvent>({ eventName: "identity" });

export function broadcastIdentityUpdate(siteAccountId: string, kind: EventKind): void {
    REGISTRY.broadcast(siteAccountId, { kind });
}

export function registerIdentityListener(siteAccountId: string, handler: IdentityStreamHandler): () => void {
    return REGISTRY.registerListener(siteAccountId, handler);
}
