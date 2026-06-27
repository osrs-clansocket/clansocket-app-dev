import { type Request, type Response } from "express";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { handleAsync } from "../../../api/middleware.js";
import { ClanAuditActions, recordClanAudit } from "../../../database/index.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { mountedRouter } from "../_mount-registry.js";
import { isValidImageKey } from "../../homepage/homepage-image-key.js";
import { removeExistingForKey } from "../../homepage/homepage-image-storage.js";

const router = mountedRouter();

(() => {
    router.delete(
        "/:slug/homepage/images/:key",
        requireSiteAccount,
        handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const slug = String(req.params.slug ?? "").toLowerCase();
        const key = String(req.params.key ?? "");
        if (!isValidImageKey(key)) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_key" });
            return;
        }
        const owned = loadOwnedClan(slug, siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        await removeExistingForKey(owned.id, key);
        recordClanAudit(owned.id, {
            actor: siteAccountId,
            action: ClanAuditActions.HomepageImageDeleted,
            targetId: owned.id,
            payload: { imageKey: key },
        });
            res.status(HTTP_OK).json({ ok: true });
        }),
    );
})();

export default router;
