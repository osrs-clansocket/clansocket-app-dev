import { HTTP_BAD_REQUEST, HTTP_CONFLICT, HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { consentRequestedBy } from "../../../database/site/consent/query.js";
import { type Request, type Response } from "express";
import { cancelConsentRequest, allByAccount, consentById } from "../../../database/index.js";
import { broadcastIdentityUpdate } from "../../../data-rights/streams/identity-stream.js";
import { pushClaimCancel } from "../../../plugin-api/consent/claim-push.js";
import { requireAccount } from "../requirer-oauth-account.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get("/consents", (req: Request, res: Response) => {
        const siteAccountId = requireAccount(req, res);
        if (!siteAccountId) return;
        const rows = allByAccount(siteAccountId);
        res.json({
            consents: rows.map((r) => ({
                id: r.id,
                kind: r.kind,
                targetRsn: r.target_rsn,
                declaredClanName: r.declared_clan_name,
                declaredClanSlug: r.declared_clan_slug,
                status: r.status,
                createdAt: r.created_at,
                expiresAt: r.expires_at,
                resolvedAt: r.resolved_at,
            })),
        });
    });
})();

function gateConsentCancel(
    req: Request,
    siteAccountId: string,
    res: Response,
): NonNullable<ReturnType<typeof consentById>> | null {
    const id = Number.parseInt(String(req.params.id ?? ""), 10);
    if (!Number.isFinite(id) || id <= 0) {
        res.status(HTTP_BAD_REQUEST).json({ ok: false, error: "bad_id" });
        return null;
    }
    const consent = consentById(id);
    if (!consentRequestedBy(consent, siteAccountId)) {
        res.status(HTTP_NOT_FOUND).json({ ok: false, error: "not_found" });
        return null;
    }
    if (consent.kind === "rsn") {
        res.status(HTTP_FORBIDDEN).json({
            ok: false,
            error: "wrong_kind",
            message: "Cancel RSN-verify requests from the data-rights section in your profile.",
        });
        return null;
    }
    return consent;
}

(() => {
    router.delete("/consents/:id", (req: Request, res: Response) => {
        const siteAccountId = requireAccount(req, res);
        if (!siteAccountId) return;
        const consent = gateConsentCancel(req, siteAccountId, res);
        if (!consent) return;
        const cancelled = cancelConsentRequest(consent.id, siteAccountId);
        if (!cancelled) {
            res.status(HTTP_CONFLICT).json({ ok: false, error: "not_pending" });
            return;
        }
        if (consent.kind === "claim") {
            pushClaimCancel(consent.target_rsn, consent.id);
            broadcastIdentityUpdate(siteAccountId, "claim_consent_resolved");
        }
        res.json({ ok: true });
    });
})();

export default router;
