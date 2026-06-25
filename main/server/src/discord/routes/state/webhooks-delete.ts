import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { deleteWebhook } from "../../../database/discord/state/webhooks/delete-webhook.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/state");

router.delete(
    "/webhooks/:guildId/:webhookId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const webhookId = req.params.webhookId as string;
            try {
                deleteWebhook(ctx.clanId, ctx.guildId, webhookId);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(
                    `[discord] webhook delete failed for ${ctx.guildId}/${webhookId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "webhook_delete_failed" });
            }
        }),
    ),
);

export default router;
