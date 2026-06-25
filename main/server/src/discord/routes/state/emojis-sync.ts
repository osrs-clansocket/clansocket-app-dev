import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { replaceEmojis } from "../../../database/discord/state/server-emojis/replace-emojis.js";
import type { ServerEmojiRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface SyncBody {
    emojis: ServerEmojiRow[];
}

const router = mountedRouter("/state");

router.post(
    "/server-emojis/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replaceEmojis(ctx.clanId, ctx.guildId, body.emojis);
                res.status(HTTP_OK).json({ ok: true, count: body.emojis.length });
            } catch (err) {
                logger.error(`[discord] server emojis sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "server_emojis_sync_failed" });
            }
        }),
    ),
);

export default router;
