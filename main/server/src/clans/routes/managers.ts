import { ERROR_CLAN_NOT_FOUND } from "../../shared/error-reasons.js";
import { HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { recordClanAudit } from "../../database/index.js";
import { listClanManagers } from "../../database/clans/access/clan-manager-store.js";
import { accountById, hashesForAccount } from "../../database/site/site-accounts/index.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { loadOwnedClan } from "../load-owned-clan.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function projectManager(m: ReturnType<typeof listClanManagers>[number]) {
    const account = accountById(m.site_account_id);
    return {
        siteAccountId: m.site_account_id,
        siteAccountDisplay: account?.display_name ?? m.site_account_id,
        siteAccountProvider: account?.provider ?? null,
        boundAccountHashes: hashesForAccount(m.site_account_id),
        role: m.role,
        grantedVia: m.granted_via,
        grantedAt: m.granted_at,
    };
}

(() => {
    router.get("/:slug/managers", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const managers = listClanManagers(owned.id).map(projectManager);
        recordClanAudit(owned.id, {
            actor: siteAccountId,
            action: "server:read.managers",
            targetId: owned.id,
            payload: { count: managers.length },
        });
        res.json({ managers });
    });
})();

export default router;
