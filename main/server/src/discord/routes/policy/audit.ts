import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../api/middleware.js";
import { recordFromDiscord } from "../../../database/discord/audit/record.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/audit");

interface ParsedAuditBody {
    guildId: string | null;
    userId: string | null;
    action: string | null;
    data: Record<string, unknown>;
}

function parseAuditBody(body: any): ParsedAuditBody {
    const guildId = typeof body?.guildId === "string" ? body.guildId : null;
    const rawUserId = typeof body?.userId === "string" ? body.userId : null;
    const userId = rawUserId && rawUserId.length > 0 ? rawUserId : null;
    const action = typeof body?.action === "string" ? body.action : null;
    const data = body?.data && typeof body.data === "object" ? body.data : {};
    return { guildId, userId, action, data };
}

router.post(
    "/",
    authenticate,
    handleAsync(async (req: Request, res: Response) => {
        const { guildId, userId, action, data } = parseAuditBody(req.body);
        if (!guildId || !action) {
            res.status(HTTP_BAD_REQUEST).json({ error: "guildId_action_required" });
            return;
        }
        try {
            const recorded = recordFromDiscord({ discordUserId: userId, guildId, action, data });
            if (!recorded) {
                res.status(HTTP_NOT_FOUND).json({ error: "guild_not_registered" });
                return;
            }
            res.json({ ok: true });
        } catch (err) {
            logger.error(`[discord] audit record failed for ${guildId}/${userId}/${action}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "audit_record_failed" });
        }
    }),
);

export default router;
