import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { clanBySlug, listFingerprintDiffs, recordClanAudit } from "../../database/index.js";
import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { withManager } from "./manager-context.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get("/:slug/manage/me", requireSiteAccount, (req: Request, res: Response) => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        const siteAccountId = req.siteAccountId;
        if (slug.length === 0 || siteAccountId === undefined) {
            res.status(HTTP_BAD_REQUEST).json({ isManager: false });
            return;
        }
        const clan = clanBySlug(slug);
        if (!clan || clan.archived_at !== null) {
            res.status(HTTP_NOT_FOUND).json({ isManager: false });
            return;
        }
        const isManager = isClanManager(siteAccountId, clan.id);
        res.json({ isManager, clanId: isManager ? clan.id : null, slug: clan.slug });
    });
})();

function loadDiffs(clanId: string, siteAccountId: string, toFingerprint: string) {
    const diffs = listFingerprintDiffs(clanId, toFingerprint);
    recordClanAudit(clanId, {
        actor: siteAccountId,
        action: "server:read.roster_diffs",
        targetId: toFingerprint,
        payload: { count: diffs.length },
    });
    return diffs;
}

(() => {
    router.get(
        "/:slug/manage/roster-diffs",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            const toFingerprint = typeof req.query.to === "string" ? req.query.to : "";
            if (toFingerprint.length === 0) {
                res.status(HTTP_BAD_REQUEST).json({ error: "missing_fingerprint" });
                return;
            }
            try {
                res.json({ diffs: loadDiffs(ctx.clanId, ctx.siteAccountId, toFingerprint) });
            } catch (err) {
                logger.error(`[clansocket_manage] roster-diffs failed for ${ctx.clanId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "diffs_lookup_failed" });
            }
        }),
    );
})();

export default router;
