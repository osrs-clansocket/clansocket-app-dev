import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { deleteServerEmoji } from "../../../database/discord/state/server-emojis/delete-server-emoji.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/state");

router.delete(
    "/server-emojis/:guildId/:emojiId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const emojiId = req.params.emojiId as string;
            try {
                deleteServerEmoji(ctx.clanId, ctx.guildId, emojiId);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(
                    `[discord] server emoji delete failed for ${ctx.guildId}/${emojiId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "server_emoji_delete_failed" });
            }
        }),
    ),
);

export default router;
