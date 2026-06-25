import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { deleteServerSticker } from "../../../database/discord/state/server-stickers/delete-server-sticker.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/state");

router.delete(
    "/server-stickers/:guildId/:stickerId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const stickerId = req.params.stickerId as string;
            try {
                deleteServerSticker(ctx.clanId, ctx.guildId, stickerId);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(
                    `[discord] server sticker delete failed for ${ctx.guildId}/${stickerId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "server_sticker_delete_failed" });
            }
        }),
    ),
);

export default router;
