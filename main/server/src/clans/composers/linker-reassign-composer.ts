import type { Response } from "express";
import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { completeReassign } from "./complete-reassign.js";
import { preflightReassign } from "./preflight-reassign.js";
import type { LinkerReassignBody, LinkerReassignContext, LinkerReassignSpec } from "./linker-reassign-types.js";

export type { LinkerReassignSpec, LinkerReassignContext, LinkerReassignBody } from "./linker-reassign-types.js";

export function composeLinkerReassign<TIdentity>(spec: LinkerReassignSpec<TIdentity>) {
    return function runLinkerReassign(ctx: LinkerReassignContext, body: LinkerReassignBody, res: Response): boolean {
        const newLinkerUserId = preflightReassign(ctx, body, res);
        if (newLinkerUserId === null) return false;
        const existing = spec.identityResolver(ctx.clanId);
        if (!existing) {
            res.status(HTTP_NOT_FOUND).json({ error: spec.notFoundReason });
            return false;
        }
        if (!spec.reassignFn(ctx.clanId, newLinkerUserId)) {
            res.status(HTTP_INTERNAL_ERROR).json({ error: "reassign_failed" });
            return false;
        }
        completeReassign({ spec, ctx, res, newLinkerUserId, identity: existing });
        return true;
    };
}
