import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import { updateServerBot } from "../../../database/discord/servers/update-bot.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";
import { withClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const DEFAULT_BOT_ID = "clansocket-default";

const router = mountedRouter(MOUNT_BYO_BOT);

router.post(
    "/:slug/unbind/:guildId",
    handleAsync(
        withClan(async (ctx, req, res) => {
            const { clan } = ctx;
            const guildId = req.params.guildId as string;
            try {
                const unbound = updateServerBot(clan.id, guildId, DEFAULT_BOT_ID, null);
                if (!unbound) {
                    res.status(HTTP_BAD_REQUEST).json({ error: "guild_not_in_clan" });
                    return;
                }
                res.json({ ok: true, unbound_guild_id: guildId });
            } catch (err) {
                logger.error(
                    `[discord-byo] unbind failed slug=${clan.slug} guildId=${guildId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "unbind_failed" });
            }
        }),
    ),
);

export default router;
