import { HTTP_BAD_REQUEST, HTTP_CONFLICT, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { parseDecimal } from "../../../shared/parsers/decimal-parser.js";
import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import {
    cancelConsentRequest,
    expirePendingConsents,
    consentById,
    pendingByAccount,
    accountById,
    rsnsByAccount,
    revokeBinding,
} from "../../../database/index.js";
import { pushLiveCancel } from "../../../plugin-api/consent/rsn-verify.js";
import { broadcastIdentityUpdate } from "../../streams/identity-stream.js";
import { shapeClaimConsent, shapeRsnRequest, shapeVerifiedRsn } from "./rsn-shapers.js";
import { mountedRouter } from "../_mount-registry.js";
import { handleRsnRequest } from "./rsn-request-handler.js";

const router = mountedRouter();

function handleCancelRequest(req: Request, res: Response): void {
    const siteAccountId = req.siteAccountId!;
    const id = parseDecimal(String(req.params.id ?? ""));
    if (!Number.isFinite(id) || id <= 0) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_id" });
        return;
    }
    const req0 = consentById(id);
    if (!req0 || req0.requesting_site_account_id !== siteAccountId) {
        res.status(HTTP_NOT_FOUND).json({ error: "not_found" });
        return;
    }
    const cancelled = cancelConsentRequest(id, siteAccountId);
    if (!cancelled) {
        res.status(HTTP_CONFLICT).json({ error: "not_pending" });
        return;
    }
    if (req0.target_account_hash) pushLiveCancel(req0.target_account_hash, id);
    broadcastIdentityUpdate(siteAccountId, "cancelled");
    res.json({ ok: true });
}

(() => {
    router.get("/me/identification", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        expirePendingConsents();
        const account = accountById(siteAccountId);
        res.json({
            displayName: account?.display_name ?? null,
            verifiedRsns: rsnsByAccount(siteAccountId).map(shapeVerifiedRsn),
            pendingRequests: pendingByAccount(siteAccountId, "rsn").map(shapeRsnRequest),
            pendingClaimConsents: pendingByAccount(siteAccountId, "claim").map(shapeClaimConsent),
        });
    });
})();

(() => {
    router.post("/me/rsn/request", requireSiteAccount, handleRsnRequest);
})();

(() => {
    router.delete("/me/rsn/:accountHash", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const accountHash = String(req.params.accountHash ?? "").trim();
        if (accountHash.length === 0) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_hash" });
            return;
        }
        const removed = revokeBinding(siteAccountId, accountHash);
        if (!removed) {
            res.status(HTTP_NOT_FOUND).json({ error: "not_found" });
            return;
        }
        broadcastIdentityUpdate(siteAccountId, "removed");
        res.json({ ok: true });
    });
})();

(() => {
    router.delete("/me/rsn/request/:id", requireSiteAccount, handleCancelRequest);
})();

export default router;
