import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../../database/clans/audit/clan-audit/record.js";
import { upsertAutoHook } from "../../../database/discord/auto-hooks/upsert.js";
import { maybeHealWebhook } from "../../../database/discord/webhook-heal/check-and-enqueue.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { autoHookPreflight } from "./auto-hook-preflight.js";

import { MOUNT_AUTO_HOOKS } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";

interface UpdateBody {
    userId: string;
    userName: string | null;
    autoHookName: string;
    triggerType: string;
    webhookId: string;
    contentTemplate: string | null;
    useEmbed: boolean;
    embedTemplateJson: string | null;
    conditionsJson: string | null;
    enabled: boolean;
    webhookUsernameOverride: string | null;
    webhookAvatarUrlOverride: string | null;
}

const router = mountedRouter(MOUNT_AUTO_HOOKS);

interface UpsertArgs {
    body: UpdateBody;
    clanId: string;
    guildId: string;
    autoHookId: string;
}

function doUpsertHook(a: UpsertArgs): void {
    upsertAutoHook({
        clanId: a.clanId,
        autoHookName: a.body.autoHookName,
        triggerType: a.body.triggerType,
        webhookId: a.body.webhookId,
        contentTemplate: a.body.contentTemplate,
        useEmbed: a.body.useEmbed,
        embedTemplateJson: a.body.embedTemplateJson,
        conditionsJson: a.body.conditionsJson,
        enabled: a.body.enabled,
        webhookUsernameOverride: a.body.webhookUsernameOverride,
        webhookAvatarUrlOverride: a.body.webhookAvatarUrlOverride,
        createdByAccountId: a.body.userId,
        createdByAccountName: a.body.userName,
        guildId: a.guildId,
        autoHookId: a.autoHookId,
    });
}

function auditHookUpdate(a: UpsertArgs): void {
    recordClanAudit(a.clanId, {
        actor: a.body.userId,
        action: ClanAuditActions.DiscordAutoHookUpdated,
        targetId: a.autoHookId,
        guildId: a.guildId,
        payload: {
            targetName: a.body.autoHookName,
            autoHookName: a.body.autoHookName,
            guildId: a.guildId,
            autoHookId: a.autoHookId,
        },
    });
}

function applyHookUpdate(args: UpsertArgs, body: UpdateBody, server: { bot_id: string; clan_id: string }): void {
    doUpsertHook(args);
    maybeHealWebhook({
        botId: server.bot_id,
        clanId: server.clan_id,
        webhookId: body.webhookId,
        guildId: args.guildId,
    });
    auditHookUpdate(args);
}

router.patch(
    "/:guildId/:autoHookId",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as UpdateBody;
        const ctx = autoHookPreflight(req, res, "update", body.userId);
        if (!ctx) return;
        const autoHookId = req.params.autoHookId as string;
        const args: UpsertArgs = { body, autoHookId, clanId: ctx.server.clan_id, guildId: ctx.guildId };
        try {
            applyHookUpdate(args, body, ctx.server);
            res.status(HTTP_OK).json({ ok: true });
        } catch (err) {
            logger.error(`[discord] auto-hook update failed for ${autoHookId}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "auto_hook_update_failed" });
        }
    }),
);

export default router;
