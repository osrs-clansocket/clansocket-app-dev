import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../api/middleware.js";
import { listDecryptedBots } from "../../../database/discord/list-bots.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/bots");

(() => {
    router.get(
        "/",
        authenticate,
        handleAsync(async (_req: Request, res: Response) => {
            try {
                const bots = await listDecryptedBots();
                res.json({ bots });
            } catch (err) {
                logger.error(`[discord] list bots failed: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "list_bots_failed" });
            }
        }),
    );
})();

export default router;
