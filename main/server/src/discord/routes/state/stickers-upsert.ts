import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertServerSticker } from "../../../database/discord/state/server-stickers/upsert-server-sticker.js";
import type { ServerStickerRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface UpsertBody {
    sticker: ServerStickerRow;
}

const router = mountedRouter("/state");

router.post(
    "/server-stickers/:guildId/:stickerId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertServerSticker(ctx.clanId, ctx.guildId, body.sticker);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] server sticker upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "server_sticker_upsert_failed" });
            }
        }),
    ),
);

export default router;
