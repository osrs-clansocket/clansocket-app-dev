import { type Request, type Response } from "express";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { clanBySlug } from "../../../database/index.js";
import { runAllMetrics } from "../../homepage/metrics-registry.js";
import type { ManifestEntry } from "../../homepage/metric-types.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

function toManifest(clanId: string): ManifestEntry[] {
    const rows = runAllMetrics(clanId);
    return rows.map((r) => ({ key: r.variable_key, label: r.label, category: r.category, format: r.format }));
}

(() => {
    router.get("/:slug/metrics/manifest", (req: Request, res: Response): void => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        const clan = clanBySlug(slug);
        if (!clan || clan.archived_at !== null) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        res.json({ entries: toManifest(clan.id) });
    });
})();

export default router;
