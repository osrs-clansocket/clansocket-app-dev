import { type Request, type Response } from "express";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { handleAsync } from "../../../api/middleware.js";
import { ClanAuditActions, recordClanAudit } from "../../../database/index.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { mountedRouter } from "../_mount-registry.js";
import { handleHomepageImageUpload, HOMEPAGE_IMAGE_MIME_EXT } from "../../homepage/upload-middleware-homepage.js";
import { generateImageKey } from "../../homepage/homepage-image-key.js";
import { persistHomepageImage } from "../../homepage/homepage-image-storage.js";

const router = mountedRouter();

(() => {
    router.post(
        "/:slug/homepage/images",
        requireSiteAccount,
        handleHomepageImageUpload,
        handleAsync(async (req: Request, res: Response) => {
            const siteAccountId = req.siteAccountId!;
            const slug = String(req.params.slug ?? "").toLowerCase();
            const owned = loadOwnedClan(slug, siteAccountId);
            if (!owned) {
                res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
                return;
            }
            const file = req.file;
            if (!file) {
                res.status(HTTP_BAD_REQUEST).json({ error: "no_file" });
                return;
            }
            if (!HOMEPAGE_IMAGE_MIME_EXT[file.mimetype]) {
                res.status(HTTP_BAD_REQUEST).json({ error: "bad_mime", mime: file.mimetype });
                return;
            }
            const key = generateImageKey();
            const persisted = await persistHomepageImage(owned.id, key, file.mimetype, file.buffer);
            if (!persisted) {
                res.status(HTTP_BAD_REQUEST).json({ error: "persist_failed" });
                return;
            }
            recordClanAudit(owned.id, {
                actor: siteAccountId,
                action: ClanAuditActions.HomepageImageUploaded,
                targetId: owned.id,
                payload: { imageKey: persisted.key, ext: persisted.ext, byteSize: persisted.byteSize },
            });
            res.status(HTTP_OK).json({ ok: true, key: persisted.key, ext: persisted.ext, version: persisted.version });
        }),
    );
})();

export default router;
