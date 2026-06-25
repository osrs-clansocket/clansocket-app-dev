import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../../api/middleware.js";
import { replaceOverwritesChannel } from "../../../../database/discord/state/channel-overwrites/replace-overwrites.js";
import type { ChannelOverwriteRow } from "../../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../../shared/http/http-status.js";
import { withClanCtx } from "../../route-common/preflight.js";

import { mountedRouter } from "../../_mount-registry.js";
interface SyncBody {
    overwrites: ChannelOverwriteRow[];
}

const router = mountedRouter("/state");

router.post(
    "/channel-overwrites/:guildId/:channelId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const channelId = req.params.channelId as string;
            const body = req.body as SyncBody;
            try {
                replaceOverwritesChannel(ctx.clanId, ctx.guildId, channelId, body.overwrites);
                res.status(HTTP_OK).json({ ok: true, count: body.overwrites.length });
            } catch (err) {
                logger.error(
                    `[discord] channel-overwrites sync failed for ${ctx.guildId}/${channelId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "channel_overwrites_sync_failed" });
            }
        }),
    ),
);

export default router;
