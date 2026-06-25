import logger from "@clansocket/logger";
import { type Response } from "express";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_TOO_MANY_REQUESTS } from "../../shared/http/http-status.js";
import { seoById, type ClanSeoPatch, type ClanSeoRow } from "../../database/index.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { MS_PER_SECOND } from "../../shared/time.js";
import { withManager } from "./manager-context.js";
import { mountedRouter } from "./_mount-registry.js";
import { applySeoPatch, buildPatch, flipCooldown, projectManagerSeo } from "./seo-patcher.js";

const router = mountedRouter();

function rejectCooldown(res: Response, cooldownMs: number): null {
    res.status(HTTP_TOO_MANY_REQUESTS).json({
        error: "public_flip_cooldown",
        retryAfterSeconds: Math.ceil(cooldownMs / MS_PER_SECOND),
    });
    return null;
}

function gateSeoPatch(
    clanId: string,
    body: Record<string, unknown>,
    res: Response,
): { patch: ClanSeoPatch; current: ClanSeoRow; nowMs: number } | null {
    const patch = buildPatch(body);
    if (patch === null) {
        res.status(HTTP_BAD_REQUEST).json({ error: "empty_patch" });
        return null;
    }
    const current = seoById(clanId);
    if (current === null) {
        res.status(HTTP_BAD_REQUEST).json({ error: "clan_missing" });
        return null;
    }
    const nowMs = Date.now();
    const cooldownMs = flipCooldown(current, patch, nowMs);
    if (cooldownMs > 0) return rejectCooldown(res, cooldownMs);
    return { patch, current, nowMs };
}

(() => {
    router.get(
        "/:slug/manage/seo",
        requireSiteAccount,
        withManager((ctx, _req, res) => {
            const row = seoById(ctx.clanId);
            if (row === null) {
                res.status(HTTP_BAD_REQUEST).json({ error: "clan_missing" });
                return;
            }
            res.json(projectManagerSeo(row));
        }),
    );
})();

function runSeoPatch(
    ctx: { clanId: string; siteAccountId: string },
    gate: { patch: ClanSeoPatch; current: ClanSeoRow; nowMs: number },
    res: Response,
): void {
    try {
        const row = applySeoPatch({ clanId: ctx.clanId, siteAccountId: ctx.siteAccountId, ...gate });
        if (row === null) {
            res.status(HTTP_INTERNAL_ERROR).json({ error: "post_update_read_failed" });
            return;
        }
        res.json(projectManagerSeo(row));
    } catch (err) {
        logger.error(`[clansocket_manage] seo update failed for ${ctx.clanId}: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({ error: "seo_update_failed" });
    }
}

(() => {
    router.patch(
        "/:slug/manage/seo",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            const gate = gateSeoPatch(ctx.clanId, (req.body ?? {}) as Record<string, unknown>, res);
            if (!gate) return;
            runSeoPatch(ctx, gate, res);
        }),
    );
})();

export default router;
