import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../api/middleware.js";
import { checkUserCommand } from "../../../database/discord/rate-limit/check.js";
import { setUserCommand } from "../../../database/discord/rate-limit/set.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/rate-limit");

router.post(
    "/check",
    authenticate,
    handleAsync(async (req: Request, res: Response) => {
        const identifier = typeof req.body?.identifier === "string" ? req.body.identifier : null;
        if (!identifier) {
            res.status(HTTP_BAD_REQUEST).json({ error: "identifier_required" });
            return;
        }
        try {
            const state = checkUserCommand(identifier);
            res.json(state ?? {});
        } catch (err) {
            logger.error(`[discord] rate-limit check failed for ${identifier}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "rate_limit_check_failed" });
        }
    }),
);

router.post(
    "/set",
    authenticate,
    handleAsync(async (req: Request, res: Response) => {
        const identifier = typeof req.body?.identifier === "string" ? req.body.identifier : null;
        const count = typeof req.body?.count === "number" ? req.body.count : null;
        const resetTime = typeof req.body?.reset_time === "number" ? req.body.reset_time : null;
        if (!identifier || count === null || resetTime === null) {
            res.status(HTTP_BAD_REQUEST).json({ error: "identifier_count_reset_required" });
            return;
        }
        try {
            setUserCommand(identifier, count, resetTime);
            res.json({ ok: true });
        } catch (err) {
            logger.error(`[discord] rate-limit set failed for ${identifier}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "rate_limit_set_failed" });
        }
    }),
);

export default router;
