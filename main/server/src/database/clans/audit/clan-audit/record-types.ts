import type { AnyAuditAction, PayloadFor } from "../clan-audit-registry/index.js";
import type { ActorKind } from "./list/index.js";

export interface RecordAuditArgs<A extends AnyAuditAction = AnyAuditAction> {
    actor: string | null;
    actorKind?: ActorKind;
    action: A;
    targetId?: string | null;
    guildId?: string | null;
    payload: PayloadFor<A>;
}
