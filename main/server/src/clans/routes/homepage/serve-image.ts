import { type Request, type Response } from "express";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { handleAsync } from "../../../api/middleware.js";
import { clanBySlug } from "../../../database/index.js";
import { mountedRouter } from "../_mount-registry.js";
import { isValidImageKey } from "../../homepage/homepage-image-key.js";
import { findImageByKey } from "../../homepage/homepage-image-storage.js";

const router = mountedRouter();

(() => {
    router.get(
        "/:slug/homepage/images/:key",
        handleAsync(async (req: Request, res: Response) => {
            const slug = String(req.params.slug ?? "").toLowerCase();
            const key = String(req.params.key ?? "");
            if (!isValidImageKey(key)) {
                res.status(HTTP_BAD_REQUEST).json({ error: "bad_key" });
                return;
            }
            const clan = clanBySlug(slug);
            if (!clan || clan.archived_at !== null) {
                res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
                return;
            }
            const found = await findImageByKey(clan.id, key);
            if (!found) {
                res.status(HTTP_NOT_FOUND).json({ error: "image_not_found" });
                return;
            }
            res.sendFile(found.path);
        }),
    );
})();

export default router;
