import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { deleteMember } from "../../../database/discord/state/members/delete-member.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/state");

router.delete(
    "/members/:guildId/:userId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const userId = req.params.userId as string;
            try {
                deleteMember(ctx.clanId, ctx.guildId, userId);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] member delete failed for ${ctx.guildId}/${userId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "member_delete_failed" });
            }
        }),
    ),
);

export default router;
