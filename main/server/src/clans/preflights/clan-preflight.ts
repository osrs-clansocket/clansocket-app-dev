import type { Request, Response } from "express";
import { requireAccount } from "../../auth/site-routes/requirer-oauth-account.js";
import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { clanBySlug } from "../../database/index.js";
import { HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";

export interface ClanManagerContext {
    clan: { id: string; display_name: string; slug: string };
    sid: string;
}

export function preflightClan(req: Request, res: Response): ClanManagerContext | null {
    const sid = requireAccount(req, res);
    if (!sid) return null;
    const slug = (req.params.slug as string).toLowerCase();
    const clan = clanBySlug(slug);
    if (!clan) {
        res.status(HTTP_NOT_FOUND).json({ error: "clan_not_found" });
        return null;
    }
    if (!isClanManager(sid, clan.id)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_clan_manager" });
        return null;
    }
    return { clan, sid };
}
