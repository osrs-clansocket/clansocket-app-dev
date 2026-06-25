import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import type { Actor } from "../../../clan-vault/shared/vault-types.js";
import { buildStatusRow } from "../../../data-rights/streams/topics/byo-bot-topic.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";
import { withClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_BYO_BOT);

(() => {
    router.get(
        "/:slug",
        handleAsync(
            withClan(async (ctx, _req, res) => {
                const { clan, sid } = ctx;
                try {
                    const actor: Actor = { kind: "user", user_id: sid };
                    const row = await buildStatusRow(clan.id, actor);
                    res.json(row);
                } catch (err) {
                    logger.error(`[discord-byo] status failed slug=${clan.slug}: ${(err as Error).message}`);
                    res.status(HTTP_INTERNAL_ERROR).json({ error: "status_failed" });
                }
            }),
        ),
    );
})();

export default router;
