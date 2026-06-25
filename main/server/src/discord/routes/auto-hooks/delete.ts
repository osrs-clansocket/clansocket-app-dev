import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../../database/clans/audit/clan-audit/record.js";
import { deleteAutoHook } from "../../../database/discord/auto-hooks/delete.js";
import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { autoHookPreflight } from "./auto-hook-preflight.js";

import { MOUNT_AUTO_HOOKS } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";

interface DeleteBody {
    userId: string;
    autoHookName: string;
}

const router = mountedRouter(MOUNT_AUTO_HOOKS);

interface DeleteAuditArgs {
    clanId: string;
    userId: string;
    autoHookId: string;
    guildId: string;
    autoHookName: string;
}

function auditHookDelete(a: DeleteAuditArgs): void {
    recordClanAudit(a.clanId, {
        actor: a.userId,
        action: ClanAuditActions.DiscordAutoHookDeleted,
        targetId: a.autoHookId,
        guildId: a.guildId,
        payload: { targetName: a.autoHookName, guildId: a.guildId, autoHookId: a.autoHookId },
    });
}

interface HookDeleteArgs {
    clanId: string;
    guildId: string;
    autoHookId: string;
    body: DeleteBody;
    res: Response;
}

function runHookDelete(a: HookDeleteArgs): void {
    try {
        if (!deleteAutoHook(a.clanId, a.guildId, a.autoHookId)) {
            a.res.status(HTTP_NOT_FOUND).json({ error: "auto_hook_not_found" });
            return;
        }
        auditHookDelete({
            clanId: a.clanId,
            userId: a.body.userId,
            autoHookId: a.autoHookId,
            guildId: a.guildId,
            autoHookName: a.body.autoHookName,
        });
        a.res.status(HTTP_OK).json({ ok: true });
    } catch (err) {
        logger.error(`[discord] auto-hook delete failed for ${a.autoHookId}: ${(err as Error).message}`);
        a.res.status(HTTP_INTERNAL_ERROR).json({ error: "auto_hook_delete_failed" });
    }
}

router.delete(
    "/:guildId/:autoHookId",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as DeleteBody;
        const ctx = autoHookPreflight(req, res, "delete", body.userId);
        if (!ctx) return;
        runHookDelete({
            clanId: ctx.server.clan_id,
            guildId: ctx.guildId,
            autoHookId: req.params.autoHookId as string,
            body,
            res,
        });
    }),
);

export default router;
