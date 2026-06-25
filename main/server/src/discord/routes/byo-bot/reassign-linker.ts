import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { byoForClan } from "../../../database/discord/byo/byo-identity.js";
import { reassignLinker } from "../../../database/discord/byo/reassign-linker.js";
import { composeLinkerReassign, type LinkerReassignBody } from "../../../clans/composers/linker-reassign-composer.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
import { withClan, type PreflightClanContext } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

type ByoIdentity = NonNullable<ReturnType<typeof byoForClan>>;

const router = mountedRouter(MOUNT_BYO_BOT);

const runByoReassign = composeLinkerReassign<ByoIdentity>({
    auditAction: ClanAuditActions.DiscordBotLinkerReassigned,
    identityResolver: byoForClan,
    reassignFn: (clanId, newLinkerSiteAccountId) => reassignLinker({ clanId, newLinkerSiteAccountId }),
    targetIdFor: (identity) => identity.bot_id,
    previousLinkerFor: (identity) => identity.owner_site_account_id ?? "",
    notFoundReason: "no_byo_bot_linked",
});

async function runReassign(ctx: PreflightClanContext, req: Request, res: Response): Promise<void> {
    try {
        runByoReassign({ clanId: ctx.clan.id, sid: ctx.sid }, req.body as LinkerReassignBody, res);
    } catch (err) {
        logger.error(`[discord-byo] reassign-linker failed slug=${ctx.clan.slug}: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({ error: "reassign_failed" });
    }
}

router.post("/:slug/reassign-linker", handleAsync(withClan(runReassign)));

export default router;
