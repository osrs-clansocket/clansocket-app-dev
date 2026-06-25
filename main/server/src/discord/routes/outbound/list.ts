import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { listPendingBot } from "../../../database/discord/outbound/list-pending.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/outbound");

(() => {
    router.get(
        "/:botId",
        handleAsync(async (req: Request, res: Response) => {
            const botId = req.params.botId as string;
            try {
                const events = listPendingBot(botId);
                res.json({ events });
            } catch (err) {
                logger.error(`[discord] outbound list failed for ${botId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "outbound_list_failed" });
            }
        }),
    );
})();

export default router;
