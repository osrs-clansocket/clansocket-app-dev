import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertWebhook } from "../../../database/discord/state/webhooks/upsert-webhook.js";
import type { WebhookRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface UpsertBody {
    webhook: WebhookRow;
}

const router = mountedRouter("/state");

router.post(
    "/webhooks/:guildId/:webhookId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertWebhook(ctx.clanId, ctx.guildId, body.webhook);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] webhook upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "webhook_upsert_failed" });
            }
        }),
    ),
);

export default router;
