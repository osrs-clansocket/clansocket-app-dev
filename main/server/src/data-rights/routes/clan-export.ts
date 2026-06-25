import { ERROR_CLAN_NOT_FOUND, ERROR_EXPORT_FAILED } from "../../shared/error-reasons.js";
import { HTTP_FORBIDDEN, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { clanBySlug, isClanManager, type ClanRow } from "../../database/index.js";
import { recordAction } from "../cooldown.js";
import { collectClanData } from "../collect/collect-clan/index.js";
import { streamZipResponse } from "../collect/zip-stream.js";
import { ACTION_CLAN_EXPORT } from "../scopes/action-kinds.js";
import { enforceCooldown } from "./cooldown-gate.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function gateClanExport(siteAccountId: string, slug: string, res: Response): ClanRow | null {
    const clan = clanBySlug(slug);
    if (!clan || clan.archived_at !== null) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
        return null;
    }
    if (!isClanManager(siteAccountId, clan.id)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_manager" });
        return null;
    }
    if (
        !enforceCooldown({
            siteAccountId,
            res,
            action: ACTION_CLAN_EXPORT,
            targetId: clan.id,
            messageSuffix: "before exporting this clan again.",
        })
    ) {
        return null;
    }
    return clan;
}

(() => {
    router.get("/clan/:slug/export", requireSiteAccount, async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const slug = String(req.params.slug ?? "").toLowerCase();
        const clan = gateClanExport(siteAccountId, slug, res);
        if (!clan) return;
        const collected = collectClanData(clan.id);
        if (!collected) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        try {
            await streamZipResponse(collected.entries, res, `clansocket-clan-${clan.slug}.zip`);
            recordAction(siteAccountId, ACTION_CLAN_EXPORT, clan.id);
        } catch (err) {
            if (!res.headersSent) {
                res.status(HTTP_INTERNAL_ERROR).json({ error: ERROR_EXPORT_FAILED, message: (err as Error).message });
            }
        }
    });
})();

export default router;
