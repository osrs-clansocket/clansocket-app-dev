import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertMember } from "../../../database/discord/state/members/upsert-member.js";
import type { MemberRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface UpsertBody {
    member: MemberRow;
}

const router = mountedRouter("/state");

router.post(
    "/members/:guildId/:userId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertMember(ctx.clanId, ctx.guildId, body.member);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] member upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "member_upsert_failed" });
            }
        }),
    ),
);

export default router;
