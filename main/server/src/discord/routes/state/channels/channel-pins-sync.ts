import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../../api/middleware.js";
import { replacePinsChannel } from "../../../../database/discord/state/channel-pins/replace-pins.js";
import type { ChannelPinRow } from "../../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../../shared/http/http-status.js";
import { withClanCtx } from "../../route-common/preflight.js";

import { mountedRouter } from "../../_mount-registry.js";
interface SyncBody {
    channelId: string;
    pins: ChannelPinRow[];
}

const router = mountedRouter("/state");

router.post(
    "/channel-pins/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replacePinsChannel(ctx.clanId, ctx.guildId, body.channelId, body.pins);
                res.status(HTTP_OK).json({ ok: true, count: body.pins.length });
            } catch (err) {
                logger.error(`[discord] channel-pins sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "channel_pins_sync_failed" });
            }
        }),
    ),
);

export default router;
