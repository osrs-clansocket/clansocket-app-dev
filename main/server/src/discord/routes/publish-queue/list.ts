import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../api/middleware.js";
import { listPendingQueue } from "../../../database/discord/publish-queue/list-pending.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/publish-queue");

(() => {
    router.get(
        "/:clanId/:guildId",
        authenticate,
        handleAsync(async (req: Request, res: Response) => {
            const clanId = req.params.clanId as string;
            const guildId = req.params.guildId as string;
            try {
                const events = listPendingQueue(clanId, guildId);
                res.json({ events });
            } catch (err) {
                logger.error(`[discord] publish-queue list failed for ${clanId}/${guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "publish_queue_list_failed" });
            }
        }),
    );
})();

export default router;
