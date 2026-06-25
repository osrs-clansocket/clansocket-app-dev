import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../../api/middleware.js";
import { deleteChannel } from "../../../../database/discord/state/channels/delete-channel.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../../shared/http/http-status.js";
import { withClanCtx } from "../../route-common/preflight.js";

import { mountedRouter } from "../../_mount-registry.js";
const router = mountedRouter("/state");

router.delete(
    "/channels/:guildId/:channelId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const channelId = req.params.channelId as string;
            try {
                deleteChannel(ctx.clanId, ctx.guildId, channelId);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(
                    `[discord] channel delete failed for ${ctx.guildId}/${channelId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "channel_delete_failed" });
            }
        }),
    ),
);

export default router;
