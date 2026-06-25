import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { guildSettingsTopic } from "../../../data-rights/streams/topics/settings-topic.js";
import { validateGuildId } from "../../../api/middleware.js";
import { streamGuildProjection } from "../route-common/projection-stream.js";
import { MOUNT_GUILD_SETTINGS, PATH_GUILD_STREAM } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_GUILD_SETTINGS);

(() => {
    router.get(PATH_GUILD_STREAM, requireSiteAccount, validateGuildId, (req: Request, res: Response) => {
        streamGuildProjection(req, res, "discord_guild_settings", guildSettingsTopic);
    });
})();

export default router;
