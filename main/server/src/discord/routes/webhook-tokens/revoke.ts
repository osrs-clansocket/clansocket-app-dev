import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../../database/clans/audit/clan-audit/record.js";
import { deleteWebhookToken } from "../../../database/discord/webhook-tokens/delete.js";
import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { preflightGuild } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const RATE_LIMIT_ROUTE = "/guilds/:id";
const CLANSOCKET_PERMISSION = "discord:webhook-tokens.revoke";

interface RevokeBody {
    userId: string;
    webhookName: string;
}

const router = mountedRouter("/webhook-tokens");

interface RevokeAuditArgs {
    clanId: string;
    userId: string;
    webhookId: string;
    guildId: string;
    webhookName: string;
}

function auditWebhookRevoke(a: RevokeAuditArgs): void {
    recordClanAudit(a.clanId, {
        actor: a.userId,
        action: ClanAuditActions.DiscordWebhookTokenRevoked,
        targetId: a.webhookId,
        guildId: a.guildId,
        payload: { targetName: a.webhookName, guildId: a.guildId, webhookId: a.webhookId },
    });
}

interface WebhookRevokeArgs {
    clanId: string;
    guildId: string;
    webhookId: string;
    body: RevokeBody;
    res: Response;
}

function runWebhookRevoke(a: WebhookRevokeArgs): void {
    try {
        if (!deleteWebhookToken(a.clanId, a.guildId, a.webhookId)) {
            a.res.status(HTTP_NOT_FOUND).json({ error: "webhook_token_not_found" });
            return;
        }
        auditWebhookRevoke({
            clanId: a.clanId,
            userId: a.body.userId,
            webhookId: a.webhookId,
            guildId: a.guildId,
            webhookName: a.body.webhookName,
        });
        a.res.status(HTTP_OK).json({ ok: true });
    } catch (err) {
        logger.error(`[discord] webhook-token revoke failed for ${a.webhookId}: ${(err as Error).message}`);
        a.res.status(HTTP_INTERNAL_ERROR).json({ error: "webhook_token_revoke_failed" });
    }
}

router.delete(
    "/:guildId/:webhookId",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as RevokeBody;
        const ctx = preflightGuild({
            req,
            res,
            clansocketPermission: CLANSOCKET_PERMISSION,
            rateLimitRoute: RATE_LIMIT_ROUTE,
            actorUserId: body.userId,
        });
        if (!ctx) return;
        runWebhookRevoke({
            clanId: ctx.server.clan_id,
            guildId: ctx.guildId,
            webhookId: req.params.webhookId as string,
            body,
            res,
        });
    }),
);

export default router;
