import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertServerEmoji } from "../../../database/discord/state/server-emojis/upsert-server-emoji.js";
import type { ServerEmojiRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface UpsertBody {
    emoji: ServerEmojiRow;
}

const router = mountedRouter("/state");

router.post(
    "/server-emojis/:guildId/:emojiId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertServerEmoji(ctx.clanId, ctx.guildId, body.emoji);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] server emoji upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "server_emoji_upsert_failed" });
            }
        }),
    ),
);

export default router;
