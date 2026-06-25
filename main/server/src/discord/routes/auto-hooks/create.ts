import { randomUUID } from "node:crypto";
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

interface CreateBody {
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

interface CreateCtx {
    server: { bot_id: string; clan_id: string };
    guildId: string;
}

function upsertCreated(autoHookId: string, ctx: CreateCtx, body: CreateBody): void {
    upsertAutoHook({
        clanId: ctx.server.clan_id,
        autoHookName: body.autoHookName,
        triggerType: body.triggerType,
        webhookId: body.webhookId,
        contentTemplate: body.contentTemplate,
        useEmbed: body.useEmbed,
        embedTemplateJson: body.embedTemplateJson,
        conditionsJson: body.conditionsJson,
        enabled: body.enabled,
        webhookUsernameOverride: body.webhookUsernameOverride,
        webhookAvatarUrlOverride: body.webhookAvatarUrlOverride,
        createdByAccountId: body.userId,
        createdByAccountName: body.userName,
        guildId: ctx.guildId,
        autoHookId,
    });
}

function auditCreated(autoHookId: string, ctx: CreateCtx, body: CreateBody): void {
    recordClanAudit(ctx.server.clan_id, {
        actor: body.userId,
        action: ClanAuditActions.DiscordAutoHookCreated,
        targetId: autoHookId,
        guildId: ctx.guildId,
        payload: {
            targetName: body.autoHookName,
            autoHookName: body.autoHookName,
            triggerType: body.triggerType,
            webhookId: body.webhookId,
            guildId: ctx.guildId,
            autoHookId,
        },
    });
}

function persistNew(autoHookId: string, ctx: CreateCtx, body: CreateBody): void {
    upsertCreated(autoHookId, ctx, body);
    maybeHealWebhook({
        botId: ctx.server.bot_id,
        clanId: ctx.server.clan_id,
        webhookId: body.webhookId,
        guildId: ctx.guildId,
    });
    auditCreated(autoHookId, ctx, body);
}

const router = mountedRouter(MOUNT_AUTO_HOOKS);

router.post(
    "/:guildId",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as CreateBody;
        const ctx = autoHookPreflight(req, res, "create", body.userId);
        if (!ctx) return;
        try {
            const autoHookId = randomUUID();
            persistNew(autoHookId, ctx, body);
            res.status(HTTP_OK).json({ autoHookId });
        } catch (err) {
            logger.error(`[discord] auto-hook create failed for ${ctx.guildId}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "auto_hook_create_failed" });
        }
    }),
);

export default router;
