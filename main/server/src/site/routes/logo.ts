import fs from "node:fs";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import multer from "multer";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { applyVersionedCache, setRevalidateCache } from "../../shared/http/cache-headers.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { isSiteOwner } from "../site-owner.js";
import { logoThumbnailPath, writeThumbnail } from "../site-asset-storage.js";
import { clearSiteEnvelope } from "../site-logo-derivation.js";
import { FIVE_MB_BYTES } from "../../shared/byte-units.js";
import { mountedRouter } from "./_mount-registry.js";

const SITE_LOGO_MAX_BYTES = FIVE_MB_BYTES;

const handleUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: SITE_LOGO_MAX_BYTES },
}).single("file");

const router = mountedRouter();

(() => {
    router.get("/logo", (req: Request, res: Response) => {
        const p = logoThumbnailPath();
        if (!fs.existsSync(p)) {
            res.status(HTTP_NOT_FOUND).end();
            return;
        }
        const v = typeof req.query.v === "string" ? req.query.v : "";
        if (v.length > 0) applyVersionedCache(req, res, v);
        else setRevalidateCache(res);
        res.sendFile(p);
    });
})();

(() => {
    router.post("/logo", requireSiteAccount, handleUpload, (req: Request, res: Response) => {
        if (!isSiteOwner(req.siteAccountId)) {
            res.status(HTTP_FORBIDDEN).json({ error: "not_owner" });
            return;
        }
        const file = req.file;
        if (!file) {
            res.status(HTTP_BAD_REQUEST).json({ error: "no_file" });
            return;
        }
        try {
            writeThumbnail(file.buffer);
            clearSiteEnvelope();
        } catch (err) {
            logger.warn?.(`[site] logo write failed err=${String(err)}`);
            res.status(HTTP_BAD_REQUEST).json({ error: "write_failed" });
            return;
        }
        res.json({ ok: true });
    });
})();

export default router;
