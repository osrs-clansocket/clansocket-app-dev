import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../../api/middleware.js";
import { replaceChannelsGuild } from "../../../../database/discord/state/channels/replace-channels.js";
import type { ChannelRow } from "../../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../../shared/http/http-status.js";
import { withClanCtx } from "../../route-common/preflight.js";

import { mountedRouter } from "../../_mount-registry.js";
interface SyncBody {
    channels: ChannelRow[];
}

const router = mountedRouter("/state");

router.post(
    "/channels/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replaceChannelsGuild(ctx.clanId, ctx.guildId, body.channels);
                res.status(HTTP_OK).json({ ok: true, count: body.channels.length });
            } catch (err) {
                logger.error(`[discord] channels sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "channels_sync_failed" });
            }
        }),
    ),
);

export default router;
