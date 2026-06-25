import logger from "@clansocket/logger";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { listPinsChannel } from "../../../database/discord/state/channel-pins/pins-by-channel.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withServer } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/channels");

(() => {
    router.get(
        "/:guildId/:channelId/pins",
        validateGuildId,
        handleAsync(
            withServer(async (ctx, req, res) => {
                const channelId = req.params.channelId as string;
                try {
                    const pins = listPinsChannel(ctx.server.clan_id, ctx.guildId, channelId);
                    res.status(HTTP_OK).json({ pins });
                } catch (err) {
                    logger.error(
                        `[discord] channel-pins list failed for ${ctx.guildId}/${channelId}: ${(err as Error).message}`,
                    );
                    res.status(HTTP_INTERNAL_ERROR).json({ error: "channel_pins_list_failed" });
                }
            }),
        ),
    );
})();

export default router;
