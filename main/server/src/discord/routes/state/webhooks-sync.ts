import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { remapWebhook } from "../../../database/discord/auto-hooks/remap-webhook.js";
import { replaceWebhooksChannel } from "../../../database/discord/state/webhooks/replace-webhooks.js";
import type { WebhookRow } from "../../../database/discord/state/types.js";
import { deleteWebhookToken } from "../../../database/discord/webhook-tokens/delete.js";
import { upsertWebhookToken } from "../../../database/discord/webhook-tokens/upsert.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface WebhookTokenSync {
    webhookId: string;
    webhookName: string | null;
    channelId: string;
    channelName: string | null;
    plaintextToken: string;
    acquiredByBotId: string;
    acquiredByBotName: string | null;
}

interface WebhookReplacement {
    oldWebhookId: string;
    newWebhookId: string;
}

interface SyncBody {
    channelId: string;
    webhooks: WebhookRow[];
    tokens?: WebhookTokenSync[];
    replacement?: WebhookReplacement;
}

function persistTokens(clanId: string, guildId: string, tokens: readonly WebhookTokenSync[]): void {
    for (const tok of tokens) {
        try {
            upsertWebhookToken({
                webhookId: tok.webhookId,
                webhookName: tok.webhookName,
                channelId: tok.channelId,
                channelName: tok.channelName,
                plaintextToken: tok.plaintextToken,
                acquiredByBotId: tok.acquiredByBotId,
                acquiredByBotName: tok.acquiredByBotName,
                boundBySiteAccountId: null,
                boundBySiteAccountName: null,
                clanId,
                guildId,
            });
        } catch (err) {
            logger.warn(`[discord] token persist failed for ${tok.webhookId}: ${(err as Error).message}`);
        }
    }
}

function applyReplacement(clanId: string, guildId: string, replacement: WebhookReplacement): void {
    try {
        const remapped = remapWebhook(clanId, guildId, replacement.oldWebhookId, replacement.newWebhookId);
        deleteWebhookToken(clanId, guildId, replacement.oldWebhookId);
        logger.info(
            `[discord] webhook healed: ${replacement.oldWebhookId} → ${replacement.newWebhookId} (${remapped} auto-hooks remapped)`,
        );
    } catch (err) {
        logger.warn(`[discord] webhook replacement apply failed: ${(err as Error).message}`);
    }
}

const router = mountedRouter("/state");

router.post(
    "/webhooks/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replaceWebhooksChannel(ctx.clanId, ctx.guildId, body.channelId, body.webhooks);
                persistTokens(ctx.clanId, ctx.guildId, body.tokens ?? []);
                if (body.replacement) applyReplacement(ctx.clanId, ctx.guildId, body.replacement);
                res.status(HTTP_OK).json({ ok: true, count: body.webhooks.length });
            } catch (err) {
                logger.error(`[discord] webhooks sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "webhooks_sync_failed" });
            }
        }),
    ),
);

export default router;
