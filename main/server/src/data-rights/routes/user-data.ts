import { ERROR_EXPORT_FAILED } from "../../shared/error-reasons.js";
import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { hashesForAccount } from "../../database/index.js";
import { recordAction } from "../cooldown.js";
import { collectUserData } from "../collect/collect-user/index.js";
import { collectUserStats } from "../collect/collect-user-stats/index.js";
import { ownedClans, purgeUserData } from "../purge/purge-user/index.js";
import { purgeClanData } from "../purge/purge-clan.js";
import { streamZipResponse } from "../collect/zip-stream.js";
import { ACTION_USER_EXPORT } from "../scopes/action-kinds.js";
import { COOKIE_SITE_SESSION } from "../../auth/oauth-providers.js";
import { enforceCooldown } from "./cooldown-gate.js";
import { mountedRouter } from "./_mount-registry.js";

const SESSION_COOKIE = COOKIE_SITE_SESSION;

const router = mountedRouter();

(() => {
    router.get("/me/stats", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const hashes = hashesForAccount(siteAccountId);
        const stats = collectUserStats(siteAccountId, hashes);
        res.json(stats);
    });
})();

function buildExportBundle(siteAccountId: string, hashes: readonly string[]) {
    const allEntries = [] as Awaited<ReturnType<typeof collectUserData>>["entries"];
    const summaries: Array<Awaited<ReturnType<typeof collectUserData>>["summary"]> = [];
    for (const hash of hashes) {
        const collected = collectUserData(hash, siteAccountId);
        for (const e of collected.entries) {
            if (e.path === "manifest.json") continue;
            allEntries.push({ ...e, path: `${hash}/${e.path}` });
        }
        summaries.push(collected.summary);
    }
    allEntries.unshift({
        path: "manifest.json",
        json: { siteAccountId, exportedAt: Date.now(), accountHashes: hashes, perAccountSummaries: summaries },
    });
    return allEntries;
}

function gateExport(siteAccountId: string, res: Response): { hashes: readonly string[] } | null {
    if (
        !enforceCooldown({
            siteAccountId,
            res,
            action: ACTION_USER_EXPORT,
            targetId: null,
            messageSuffix: "before exporting again.",
        })
    ) {
        return null;
    }
    const hashes = hashesForAccount(siteAccountId);
    if (hashes.length === 0) {
        res.status(HTTP_NOT_FOUND).json({ error: "no_data", message: "No game data linked to this account." });
        return null;
    }
    return { hashes };
}

(() => {
    router.get("/me/export", requireSiteAccount, async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const gate = gateExport(siteAccountId, res);
        if (!gate) return;
        const allEntries = buildExportBundle(siteAccountId, gate.hashes);
        try {
            await streamZipResponse(allEntries, res, `clansocket-user-export-${siteAccountId}.zip`);
            recordAction(siteAccountId, ACTION_USER_EXPORT, null);
        } catch (err) {
            if (!res.headersSent) {
                res.status(HTTP_INTERNAL_ERROR).json({ error: ERROR_EXPORT_FAILED, message: (err as Error).message });
            }
        }
    });
})();

(() => {
    router.post("/me/delete", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const hashes = hashesForAccount(siteAccountId);

        const purgedClans: string[] = [];
        for (const hash of hashes) {
            for (const clan of ownedClans(hash)) {
                purgeClanData(clan.id);
                purgedClans.push(clan.slug);
            }
        }

        const userResults = hashes.map((hash) => purgeUserData(hash, siteAccountId));

        res.clearCookie(SESSION_COOKIE, { path: "/" });

        res.json({ ok: true, purgedClans, userResults });
    });
})();

export default router;
