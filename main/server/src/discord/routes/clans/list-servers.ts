import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import { listByClan } from "../../../database/discord/servers/list-by-clan.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";
import { withClan } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/clans");

(() => {
    router.get(
        "/:slug/servers",
        handleAsync(
            withClan(async (ctx, _req, res) => {
                const { clan } = ctx;
                try {
                    const servers = listByClan(clan.id);
                    res.json({ servers });
                } catch (err) {
                    logger.error(`[discord] list-servers failed for slug=${clan.slug}: ${(err as Error).message}`);
                    res.status(HTTP_INTERNAL_ERROR).json({ error: "list_servers_failed" });
                }
            }),
        ),
    );
})();

export default router;
