import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { replaceMembersGuild } from "../../../database/discord/state/members/replace-members.js";
import type { MemberRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface SyncBody {
    members: MemberRow[];
}

const router = mountedRouter("/state");

router.post(
    "/members/:guildId/sync",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as SyncBody;
            try {
                replaceMembersGuild(ctx.clanId, ctx.guildId, body.members);
                res.status(HTTP_OK).json({ ok: true, count: body.members.length });
            } catch (err) {
                logger.error(`[discord] members sync failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "members_sync_failed" });
            }
        }),
    ),
);

export default router;
