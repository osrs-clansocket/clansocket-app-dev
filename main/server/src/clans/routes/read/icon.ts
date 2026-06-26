import { HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { HEADER_CONTENT_TYPE } from "../../../shared/http/http-mime.js";
import { setRevalidateCache } from "../../../shared/http/cache-headers.js";
import { applyVersionedCache } from "../../../shared/http/cache-versioning.js";
import { type Request, type Response } from "express";
import { clanBySlug } from "../../../database/index.js";
import { findIconPath, pristineIconPath, ICON_MIME_BY_EXT } from "../../icon/index.js";
import { iconVersionFor } from "../../clan-view-builder.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

interface ServableIcon {
    clanId: string;
    iconKind: string | null;
    found: { path: string; ext: string };
    wantPristine: boolean;
}

function resolveServableIcon(req: Request, res: Response): ServableIcon | null {
    const slug = String(req.params.slug ?? "").toLowerCase();
    const clan = clanBySlug(slug);
    if (!clan || clan.archived_at !== null) {
        res.status(HTTP_NOT_FOUND).end();
        return null;
    }
    if (clan.icon_kind !== "image") {
        res.status(HTTP_NOT_FOUND).end();
        return null;
    }
    const wantPristine = req.query.pristine === "1";
    const found = wantPristine ? pristineIconPath(clan.id) : findIconPath(clan.id);
    if (!found) {
        res.status(HTTP_NOT_FOUND).end();
        return null;
    }
    return { clanId: clan.id, iconKind: clan.icon_kind, found, wantPristine };
}

(() => {
    router.get("/:slug/icon", (req: Request, res: Response) => {
        const icon = resolveServableIcon(req, res);
        if (!icon) return;
        const mime = ICON_MIME_BY_EXT[icon.found.ext] ?? "application/octet-stream";
        res.setHeader(HEADER_CONTENT_TYPE, mime);
        if (icon.wantPristine) {
            setRevalidateCache(res);
        } else {
            applyVersionedCache(req, res, String(iconVersionFor(icon.clanId, icon.iconKind)));
        }
        res.sendFile(icon.found.path);
    });
})();

export default router;
