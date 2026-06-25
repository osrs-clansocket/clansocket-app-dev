import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { replaceStickers } from "../../../database/discord/state/server-stickers/replace-stickers.js";
import type { ServerStickerRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface SyncBody {
    stickers: ServerStickerRow[];
}

const router = mountedRouter("/state");

router.post(
    "/server-stickers/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replaceStickers(ctx.clanId, ctx.guildId, body.stickers);
                res.status(HTTP_OK).json({ ok: true, count: body.stickers.length });
            } catch (err) {
                logger.error(`[discord] server stickers sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "server_stickers_sync_failed" });
            }
        }),
    ),
);

export default router;
