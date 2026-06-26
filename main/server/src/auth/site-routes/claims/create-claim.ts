import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { createConsentRequest } from "../../../database/index.js";
import { type ClanRow, clanById } from "../../../database/clans/clan-store.js";
import { accountById } from "../../../database/site/site-accounts/index.js";
import { broadcastIdentityUpdate } from "../../../data-rights/streams/identity-stream.js";
import { requireAccount } from "../requirer-oauth-account.js";
import { mountedRouter } from "../_mount-registry.js";
import { resolveLiveSession, validateGateClaim } from "./create-claim-resolvers.js";
import { auditClaimRequested } from "./audit-claim-requested.js";
import { findExistingClaim } from "./find-existing-claim.js";
import { notifyClaimPushed } from "./notify-claim-pushed.js";
import { respondClaimAccepted } from "./respond-claim-accepted.js";
import { respondClaimConflict } from "./respond-claim-conflict.js";
import { respondNoClan } from "./respond-no-clan.js";

const router = mountedRouter();

interface DispatchClaimArgs {
    siteAccountId: string;
    trimmedRsn: string;
    inGameClan: ClanRow;
    liveSessionCount: number;
    res: Response;
}

function notifyAndAudit(a: DispatchClaimArgs, consent: ReturnType<typeof createConsentRequest>): void {
    const requester = accountById(a.siteAccountId);
    notifyClaimPushed({
        rsn: a.trimmedRsn,
        requestId: consent.id,
        requesterDisplayName: requester?.display_name ?? "someone",
        clanName: a.inGameClan.display_name,
        expiresAt: consent.expires_at,
    });
    auditClaimRequested(a.inGameClan, a.siteAccountId, a.trimmedRsn);
    broadcastIdentityUpdate(a.siteAccountId, "claim_consent_created");
}

function dispatchClaimConsent(a: DispatchClaimArgs): void {
    const consent = createConsentRequest({
        kind: "claim",
        requestingSiteAccountId: a.siteAccountId,
        targetAccountHash: null,
        targetRsn: a.trimmedRsn,
        declaredClanName: a.inGameClan.display_name,
    });
    notifyAndAudit(a, consent);
    respondClaimAccepted({
        res: a.res,
        requestId: consent.id,
        expiresAt: consent.expires_at,
        liveSessionCount: a.liveSessionCount,
        clanName: a.inGameClan.display_name,
    });
}

router.post(
    "/claims",
    handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = requireAccount(req, res);
        if (!siteAccountId) return;
        const { rsn } = (req.body ?? {}) as { rsn?: unknown };
        const trimmedRsn = await validateGateClaim(rsn, res);
        if (trimmedRsn === null) return;
        const resolved = await resolveLiveSession(trimmedRsn, res);
        if (resolved === null) return;
        const { session, liveSessions } = resolved;
        const inGameClan = session.inGameClanId ? clanById(session.inGameClanId) : null;
        if (!inGameClan) {
            respondNoClan(res);
            return;
        }
        const existing = findExistingClaim(siteAccountId, trimmedRsn, inGameClan.display_name);
        if (existing) {
            respondClaimConflict(res, existing, inGameClan.display_name);
            return;
        }
        dispatchClaimConsent({ siteAccountId, trimmedRsn, inGameClan, res, liveSessionCount: liveSessions.length });
    }),
);

export default router;
