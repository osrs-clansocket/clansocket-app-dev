import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { replaceRolesGuild } from "../../../database/discord/state/roles/replace-roles.js";
import type { RoleRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface SyncBody {
    roles: RoleRow[];
}

const router = mountedRouter("/state");

router.post(
    "/roles/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replaceRolesGuild(ctx.clanId, ctx.guildId, body.roles);
                res.status(HTTP_OK).json({ ok: true, count: body.roles.length });
            } catch (err) {
                logger.error(`[discord] roles sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "roles_sync_failed" });
            }
        }),
    ),
);

export default router;
