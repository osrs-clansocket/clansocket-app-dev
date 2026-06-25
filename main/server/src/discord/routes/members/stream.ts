import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { discordMembersTopic } from "../../../data-rights/streams/topics/discord-members-topic.js";
import { validateGuildId } from "../../../api/middleware.js";
import { streamGuildProjection } from "../route-common/projection-stream.js";
import { MOUNT_MEMBERS, PATH_GUILD_STREAM } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_MEMBERS);

(() => {
    router.get(PATH_GUILD_STREAM, requireSiteAccount, validateGuildId, (req: Request, res: Response) => {
        streamGuildProjection(req, res, "discord_members", discordMembersTopic);
    });
})();

export default router;
