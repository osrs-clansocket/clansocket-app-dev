import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import { byoForClan } from "../../../database/discord/byo/byo-identity.js";
import { updateServerBot } from "../../../database/discord/servers/update-bot.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { withClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_BYO_BOT);

router.post(
    "/:slug/bind/:guildId",
    handleAsync(
        withClan(async (ctx, req, res) => {
            const { clan } = ctx;
            const guildId = req.params.guildId as string;
            try {
                const existing = byoForClan(clan.id);
                if (!existing) {
                    res.status(HTTP_NOT_FOUND).json({ error: "no_byo_bot_linked" });
                    return;
                }
                const bound = updateServerBot(clan.id, guildId, existing.bot_id, existing.bot_name);
                if (!bound) {
                    res.status(HTTP_BAD_REQUEST).json({ error: "guild_not_in_clan" });
                    return;
                }
                res.json({ ok: true, bound_guild_id: guildId, bot_id: existing.bot_id });
            } catch (err) {
                logger.error(
                    `[discord-byo] bind failed slug=${clan.slug} guildId=${guildId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "bind_failed" });
            }
        }),
    ),
);

export default router;
