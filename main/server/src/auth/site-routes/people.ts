import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import {
    ClanAuditActions,
    createManagerRequest,
    isClanManager,
    rsnsByAccount,
    recordClanAudit,
    RSN_MAX_LEN,
} from "../../database/index.js";
import { clanBySlug } from "../../database/clans/clan-store.js";
import { requireAccount } from "./oauth-session.js";
import peopleSessionsRouter from "./people-sessions.js";
import { mountedRouter } from "./_mount-registry.js";
import { tryAutoGrant } from "./auto-grant.js";

const router = mountedRouter();

function rejectRequest(res: Response, status: number, reason: string, message: string): void {
    res.status(status).json({ ok: false, reason, message });
}

type Clan = NonNullable<ReturnType<typeof clanBySlug>>;

function resolveClanRequest(clanSlug: unknown, res: Response): Clan | null {
    if (typeof clanSlug !== "string" || clanSlug.trim().length === 0) {
        rejectRequest(res, HTTP_BAD_REQUEST, "bad_payload", "Clan is required.");
        return null;
    }
    const clan = clanBySlug(clanSlug.trim().toLowerCase());
    if (!clan || clan.archived_at !== null) {
        rejectRequest(res, HTTP_NOT_FOUND, "clan_not_found", "No such clan.");
        return null;
    }
    return clan;
}

function auditMgrRequest(clanId: string, siteAccountId: string, requestId: string, declaredRsn: string): void {
    recordClanAudit(clanId, {
        actor: siteAccountId,
        action: ClanAuditActions.ManagerRequestCreated,
        targetId: requestId,
        payload: { declaredRsn, source: "site" },
    });
}

function queuePendingManager(siteAccountId: string, clan: Clan, declaredRsnStr: string, res: Response): void {
    const request = createManagerRequest({
        siteAccountId,
        clanId: clan.id,
        declaredRsn: declaredRsnStr,
        source: "site",
        declaredAccountHash: null,
        pluginVerified: false,
    });
    auditMgrRequest(clan.id, siteAccountId, request.id, declaredRsnStr);
    res.json({
        ok: true,
        status: "awaiting-owner-approval",
        slug: clan.slug,
        clanId: clan.id,
        requestId: request.id,
        next: "wait for an owner or existing manager to approve ur request from the clan dashboard.",
    });
}

router.post("/request-management", (req: Request, res: Response) => {
    const siteAccountId = requireAccount(req, res);
    if (!siteAccountId) return;
    const { clanSlug, declaredRsn } = (req.body ?? {}) as {
        clanSlug?: unknown;
        declaredRsn?: unknown;
    };
    const clan = resolveClanRequest(clanSlug, res);
    if (clan === null) return;
    if (isClanManager(siteAccountId, clan.id)) {
        res.json({ ok: true, alreadyManager: true, slug: clan.slug, clanId: clan.id });
        return;
    }
    const declaredRsnStr = typeof declaredRsn === "string" ? declaredRsn.trim() : "";
    if (declaredRsnStr.length > RSN_MAX_LEN) {
        rejectRequest(res, HTTP_BAD_REQUEST, "bad_payload", `RSN too long (max ${RSN_MAX_LEN}).`);
        return;
    }
    for (const rsnRow of rsnsByAccount(siteAccountId)) {
        if (tryAutoGrant(siteAccountId, clan, rsnRow, res)) return;
    }
    queuePendingManager(siteAccountId, clan, declaredRsnStr, res);
});

router.use(peopleSessionsRouter);

export default router;
