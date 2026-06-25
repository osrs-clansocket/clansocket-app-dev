import type { Response } from "express";
import { isOwner } from "../../clansocket/auth/clan-owner-lookup.js";
import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../shared/http/http-status.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";
import type { LinkerReassignBody, LinkerReassignContext } from "./linker-reassign-types.js";

function badRequest(res: Response, reason: string): null {
    res.status(HTTP_BAD_REQUEST).json({ ok: false, reason });
    return null;
}

export function preflightReassign(ctx: LinkerReassignContext, body: LinkerReassignBody, res: Response): string | null {
    if (!isOwner(ctx.sid, ctx.clanId)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_clan_owner" });
        return null;
    }
    const newLinkerUserId = body.new_linker_user_id;
    if (!isNonBlank(newLinkerUserId)) return badRequest(res, "missing_new_linker_user_id");
    if (!isClanManager(newLinkerUserId, ctx.clanId)) return badRequest(res, "not_a_current_clan_manager");
    return newLinkerUserId;
}
