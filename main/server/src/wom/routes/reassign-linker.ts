import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { ClanAuditActions } from "../../database/clans/audit/clan-audit-actions.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { reassignWomLinker } from "../../database/wom/identity/reassign-clan-linker.js";
import { composeLinkerReassign, type LinkerReassignBody } from "../../clans/composers/linker-reassign-composer.js";

import { mountedRouter } from "./_mount-registry.js";

type WomIdentity = NonNullable<ReturnType<typeof clanWomIdentity>>;

const router = mountedRouter();

const runWomReassign = composeLinkerReassign<WomIdentity>({
    auditAction: ClanAuditActions.WomLinkLinkerReassigned,
    identityResolver: clanWomIdentity,
    reassignFn: reassignWomLinker,
    targetIdFor: (identity) => String(identity.wom_group_id),
    previousLinkerFor: (identity) => identity.linker_site_account_id,
    notFoundReason: "no_wom_linked",
});

router.post(
    "/:slug/reassign-linker",
    handleAsync(async (req: Request, res: Response) => {
        await withClanTry(req, res, { label: "wom reassign-linker", errorCode: "reassign_failed" }, (ctx) => {
            runWomReassign({ clanId: ctx.clan.id, sid: ctx.sid }, req.body as LinkerReassignBody, res);
        });
    }),
);

export default router;
