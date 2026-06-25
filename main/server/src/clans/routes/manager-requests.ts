import {
    ERROR_CLAN_NOT_FOUND,
    ERROR_REQUEST_ALREADY_RESOLVED,
    ERROR_REQUEST_NOT_FOUND,
} from "../../shared/error-reasons.js";
import { HTTP_CONFLICT, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { ClanAuditActions, recordClanAudit } from "../../database/index.js";
import { requestById, listPendingRequests, resolveManagerRequest } from "../../database/clans/access/request-store.js";
import { accountById } from "../../database/site/site-accounts/index.js";
import { applyManagerApproval } from "./apply-manager-approval.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import {
    REQUEST_STATUS_APPROVED,
    REQUEST_STATUS_DENIED,
    REQUEST_STATUS_PENDING,
} from "../../database/site/manager-request-status.js";
import { loadOwnedClan } from "../load-owned-clan.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function projectManagerRequest(r: ReturnType<typeof listPendingRequests>[number]) {
    const account = accountById(r.site_account_id);
    return {
        id: r.id,
        siteAccountId: r.site_account_id,
        siteAccountDisplay: account?.display_name ?? r.site_account_id,
        siteAccountProvider: account?.provider ?? null,
        declaredRsn: r.declared_rsn,
        declaredAccountHash: r.declared_account_hash,
        pluginVerified: r.plugin_verified === 1,
        source: r.source,
        requestedAt: r.requested_at,
    };
}

(() => {
    router.get("/:slug/manager-requests", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const requests = listPendingRequests(owned.id).map(projectManagerRequest);
        recordClanAudit(owned.id, {
            actor: siteAccountId,
            action: "server:read.manager_requests",
            targetId: owned.id,
            payload: { count: requests.length },
        });
        res.json({ requests });
    });
})();

function gateManagerRequest(
    req: Request,
    res: Response,
    siteAccountId: string,
): {
    owned: NonNullable<ReturnType<typeof loadOwnedClan>>;
    request: NonNullable<ReturnType<typeof requestById>>;
} | null {
    const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
    if (!owned) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
        return null;
    }
    const request = requestById(String(req.params.id ?? ""));
    if (!request || request.clan_id !== owned.id || request.status !== REQUEST_STATUS_PENDING) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_REQUEST_NOT_FOUND });
        return null;
    }
    return { owned, request };
}

(() => {
    router.post("/:slug/manager-requests/:id/approve", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const gate = gateManagerRequest(req, res, siteAccountId);
        if (!gate) return;
        const resolved = resolveManagerRequest(gate.request.id, REQUEST_STATUS_APPROVED, siteAccountId);
        if (!resolved) {
            res.status(HTTP_CONFLICT).json({ error: ERROR_REQUEST_ALREADY_RESOLVED });
            return;
        }
        try {
            applyManagerApproval(resolved, siteAccountId);
            res.json({ ok: true, siteAccountId: resolved.site_account_id });
        } catch (err) {
            logger.error(`[clansocket_clans] approve failed: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "internal" });
        }
    });
})();

function auditManagerDenied(
    clanId: string,
    sid: string,
    resolved: NonNullable<ReturnType<typeof resolveManagerRequest>>,
): void {
    recordClanAudit(clanId, {
        actor: sid,
        action: ClanAuditActions.ManagerRequestDenied,
        targetId: resolved.id,
        payload: { targetSiteAccountId: resolved.site_account_id, declaredRsn: resolved.declared_rsn },
    });
}

(() => {
    router.post("/:slug/manager-requests/:id/deny", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const gate = gateManagerRequest(req, res, siteAccountId);
        if (!gate) return;
        const resolved = resolveManagerRequest(gate.request.id, REQUEST_STATUS_DENIED, siteAccountId);
        if (!resolved) {
            res.status(HTTP_CONFLICT).json({ error: ERROR_REQUEST_ALREADY_RESOLVED });
            return;
        }
        auditManagerDenied(gate.owned.id, siteAccountId, resolved);
        res.json({ ok: true });
    });
})();

export default router;
