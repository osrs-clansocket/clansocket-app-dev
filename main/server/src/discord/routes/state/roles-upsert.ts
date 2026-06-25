import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertRole } from "../../../database/discord/state/roles/upsert-role.js";
import type { RoleRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface UpsertBody {
    role: RoleRow;
}

const router = mountedRouter("/state");

router.post(
    "/roles/:guildId/:roleId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertRole(ctx.clanId, ctx.guildId, body.role);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] role upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "role_upsert_failed" });
            }
        }),
    ),
);

export default router;
