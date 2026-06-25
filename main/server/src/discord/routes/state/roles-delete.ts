import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { deleteRole } from "../../../database/discord/state/roles/delete-role.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/state");

router.delete(
    "/roles/:guildId/:roleId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const roleId = req.params.roleId as string;
            try {
                deleteRole(ctx.clanId, ctx.guildId, roleId);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] role delete failed for ${ctx.guildId}/${roleId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "role_delete_failed" });
            }
        }),
    ),
);

export default router;
