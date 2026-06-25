import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { channelOverwritesTopic } from "../../../data-rights/streams/topics/overwrites-topic.js";
import { validateGuildId } from "../../../api/middleware.js";
import { streamGuildProjection } from "../route-common/projection-stream.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/channel-overwrites");

(() => {
    router.get("/:guildId/stream", requireSiteAccount, validateGuildId, (req: Request, res: Response) => {
        streamGuildProjection(req, res, "discord_channel_overwrites", channelOverwritesTopic);
    });
})();

export default router;
