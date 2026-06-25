import { recordClanAudit, type RecordAuditArgs } from "../../database/clans/audit/clan-audit/record.js";
import type { Actor } from "../shared/vault-types.js";

interface ActorIdentity {
    actor: string | null;
    actorKind: "user" | "system";
    component: string | null;
}

function actorIdentity(actor: Actor): ActorIdentity {
    if (actor.kind === "user") return { actor: actor.user_id, actorKind: "user", component: null };
    return { actor: null, actorKind: "system", component: actor.component };
}

export function assertActor(actor: Actor): void {
    if (actor.kind === "user" && (typeof actor.user_id !== "string" || actor.user_id.length === 0)) {
        throw new Error(
            `vault actor.user_id required for kind 'user': got ${typeof actor.user_id}=${JSON.stringify(actor.user_id)}`,
        );
    }
    if (actor.kind === "system" && (typeof actor.component !== "string" || actor.component.length === 0)) {
        throw new Error(
            `vault actor.component required for kind 'system': got ${typeof actor.component}=${JSON.stringify(actor.component)}`,
        );
    }
}

export function actorAttribution(actor: Actor): string | null {
    return actorIdentity(actor).actor;
}

export interface VaultAuditArgs {
    clanId: string;
    action: string;
    entry_key: string;
    actor: Actor;
    extra?: Record<string, unknown>;
}

export function recordVaultAudit(args: VaultAuditArgs): void {
    const { clanId, action, entry_key, actor, extra = {} } = args;
    const id = actorIdentity(actor);
    const payload: Record<string, unknown> = { entry_key, ...extra };
    if (id.component !== null) payload.component = id.component;
    const entry = {
        action,
        payload,
        actor: id.actor,
        actorKind: id.actorKind,
        targetId: entry_key,
    } as unknown as RecordAuditArgs;
    recordClanAudit(clanId, entry);
}
