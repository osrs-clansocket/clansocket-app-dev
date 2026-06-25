import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../api/middleware.js";
import { getActivePresence } from "../../../database/discord/presence/get-active.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/presence");

(() => {
    router.get(
        "/:botId",
        authenticate,
        handleAsync(async (req: Request, res: Response) => {
            const botId = req.params.botId as string;
            try {
                const template = getActivePresence(botId);
                res.json({ template });
            } catch (err) {
                logger.error(`[discord] presence lookup failed for ${botId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "presence_lookup_failed" });
            }
        }),
    );
})();

export default router;
