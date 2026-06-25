import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../../api/middleware.js";
import { upsertChannel } from "../../../../database/discord/state/channels/upsert-channel.js";
import type { ChannelRow } from "../../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../../shared/http/http-status.js";
import { withClanCtx } from "../../route-common/preflight.js";

import { mountedRouter } from "../../_mount-registry.js";
interface UpsertBody {
    channel: ChannelRow;
}

const router = mountedRouter("/state");

router.post(
    "/channels/:guildId/:channelId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertChannel(ctx.clanId, ctx.guildId, body.channel);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] channel upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "channel_upsert_failed" });
            }
        }),
    ),
);

export default router;
