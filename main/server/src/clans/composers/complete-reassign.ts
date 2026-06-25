import type { Response } from "express";
import { recordClanAudit } from "../../database/clans/audit/clan-audit/record.js";
import { accountById } from "../../database/index.js";
import type { LinkerReassignContext, LinkerReassignSpec } from "./linker-reassign-types.js";

export interface CompleteArgs<TIdentity> {
    spec: LinkerReassignSpec<TIdentity>;
    ctx: LinkerReassignContext;
    identity: TIdentity;
    newLinkerUserId: string;
    res: Response;
}

export function completeReassign<TIdentity>(args: CompleteArgs<TIdentity>): void {
    const { spec, ctx, identity, newLinkerUserId, res } = args;
    recordClanAudit(ctx.clanId, {
        actor: ctx.sid,
        actorKind: "user",
        action: spec.auditAction,
        targetId: spec.targetIdFor(identity),
        payload: {
            previous_linker: spec.previousLinkerFor(identity),
            new_linker: newLinkerUserId,
            by_owner: ctx.sid,
        },
    });
    const account = accountById(newLinkerUserId);
    res.json({
        ok: true,
        new_linker: { user_id: newLinkerUserId, display_name: account?.display_name ?? newLinkerUserId },
    });
}
