import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { serverEmojisTopic } from "../../../data-rights/streams/topics/discord-emojis-topic.js";
import { validateGuildId } from "../../../api/middleware.js";
import { streamGuildProjection } from "../route-common/projection-stream.js";
import { PATH_GUILD_STREAM } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/server-emojis");

(() => {
    router.get(PATH_GUILD_STREAM, requireSiteAccount, validateGuildId, (req: Request, res: Response) => {
        streamGuildProjection(req, res, "discord_server_emojis", serverEmojisTopic);
    });
})();

export default router;
