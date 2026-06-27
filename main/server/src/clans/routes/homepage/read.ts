import { type Request, type Response } from "express";
import type { HomepageComponent } from "@clansocket/constants/clan-homepage-types";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { clanBySlug, clanUiDb } from "../../../database/index.js";
import {
    HOMEPAGE_SELECT_SQL,
    rowToComponent,
    type HomepageComponentRow,
} from "../../homepage/homepage-component-row.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

function loadComponents(clanId: string): HomepageComponent[] {
    const rows = clanUiDb(clanId).prepare(HOMEPAGE_SELECT_SQL).all() as HomepageComponentRow[];
    const out: HomepageComponent[] = [];
    for (const r of rows) {
        const c = rowToComponent(r);
        if (c !== null) out.push(c);
    }
    return out;
}

(() => {
    router.get("/:slug/homepage", (req: Request, res: Response): void => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        if (!slug) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_slug" });
            return;
        }
        const clan = clanBySlug(slug);
        if (!clan || clan.archived_at !== null) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        res.json({ components: loadComponents(clan.id) });
    });
})();

export default router;
