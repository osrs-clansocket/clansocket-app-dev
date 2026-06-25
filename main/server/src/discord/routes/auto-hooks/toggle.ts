import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../../database/clans/audit/clan-audit/record.js";
import { toggleAutoHook } from "../../../database/discord/auto-hooks/toggle.js";
import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { autoHookPreflight } from "./auto-hook-preflight.js";

import { MOUNT_AUTO_HOOKS } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";

interface ToggleBody {
    userId: string;
    enabled: boolean;
    autoHookName: string;
}

const router = mountedRouter(MOUNT_AUTO_HOOKS);

interface AuditToggleArgs {
    clanId: string;
    userId: string;
    autoHookId: string;
    guildId: string;
    autoHookName: string;
    enabled: boolean;
}

function auditToggle(a: AuditToggleArgs): void {
    recordClanAudit(a.clanId, {
        actor: a.userId,
        action: ClanAuditActions.DiscordAutoHookToggled,
        targetId: a.autoHookId,
        guildId: a.guildId,
        payload: { guildId: a.guildId, targetName: a.autoHookName, enabled: a.enabled, autoHookId: a.autoHookId },
    });
}

interface HookToggleArgs {
    clanId: string;
    guildId: string;
    autoHookId: string;
    body: ToggleBody;
    res: Response;
}

function runHookToggle(a: HookToggleArgs): void {
    try {
        if (!toggleAutoHook(a.clanId, a.guildId, a.autoHookId, a.body.enabled)) {
            a.res.status(HTTP_NOT_FOUND).json({ error: "auto_hook_not_found" });
            return;
        }
        auditToggle({
            clanId: a.clanId,
            userId: a.body.userId,
            autoHookId: a.autoHookId,
            guildId: a.guildId,
            autoHookName: a.body.autoHookName,
            enabled: a.body.enabled,
        });
        a.res.status(HTTP_OK).json({ ok: true });
    } catch (err) {
        logger.error(`[discord] auto-hook toggle failed for ${a.autoHookId}: ${(err as Error).message}`);
        a.res.status(HTTP_INTERNAL_ERROR).json({ error: "auto_hook_toggle_failed" });
    }
}

router.patch(
    "/:guildId/:autoHookId/toggle",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as ToggleBody;
        const ctx = autoHookPreflight(req, res, "toggle", body.userId);
        if (!ctx) return;
        runHookToggle({
            clanId: ctx.server.clan_id,
            guildId: ctx.guildId,
            autoHookId: req.params.autoHookId as string,
            body,
            res,
        });
    }),
);

export default router;
