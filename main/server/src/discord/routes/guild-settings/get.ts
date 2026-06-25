import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { getGuildSettings } from "../../../database/discord/state/guild-settings/get-guild-settings.js";
import { serverByGuild } from "../../../database/discord/resolve-server.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/guild-settings");

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const server = serverByGuild(guildId);
            if (!server) {
                res.status(HTTP_BAD_REQUEST).json({ error: "guild_not_bound" });
                return;
            }
            try {
                const settings = getGuildSettings(server.clan_id, guildId);
                if (!settings) {
                    res.status(HTTP_NOT_FOUND).json({ error: "guild_settings_not_found" });
                    return;
                }
                res.status(HTTP_OK).json({ settings });
            } catch (err) {
                logger.error(`[discord] guild-settings get failed for ${guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "guild_settings_get_failed" });
            }
        }),
    );
})();

export default router;
