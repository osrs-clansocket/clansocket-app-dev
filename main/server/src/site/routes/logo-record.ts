import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../shared/http/http-status.js";
import {
    acceptsBrotli,
    applyVersionedCache,
    handledNotModified,
    setRevalidateCache,
} from "../../shared/http/cache-headers.js";
import { extractEnvelope, thumbnailUploader } from "../../shared/http/envelope-upload.js";
import { HEADER_CONTENT_TYPE, MIME_JSON } from "../../shared/http/http-mime.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { isSiteOwner } from "../site-owner.js";
import { readLogoRecord } from "../site-asset-storage.js";
import { logoVersion, readLogoBrotli, writeEnvelope, writeSiteLogo } from "../site-logo-derivation.js";
import { mountedRouter } from "./_mount-registry.js";

const handleUpload = thumbnailUploader("thumbnail");

const router = mountedRouter();

(() => {
    router.get("/logo-record", (req: Request, res: Response) => {
        res.setHeader(HEADER_CONTENT_TYPE, MIME_JSON);
        res.setHeader("Vary", "Accept-Encoding");
        const version = logoVersion();
        if (version === null) {
            setRevalidateCache(res);
            res.send("null");
            return;
        }
        const etag = applyVersionedCache(req, res, version);
        if (handledNotModified(req, res, etag)) return;
        const brotli = acceptsBrotli(req) ? readLogoBrotli() : null;
        if (brotli !== null) {
            res.setHeader("Content-Encoding", "br");
            res.send(brotli);
            return;
        }
        res.send(readLogoRecord() ?? "null");
    });
})();

function gateLogoUpload(req: Request, res: Response): string | null {
    if (!isSiteOwner(req.siteAccountId)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_owner" });
        return null;
    }
    return extractEnvelope(req, res);
}

(() => {
    router.post("/logo-record", requireSiteAccount, handleUpload, (req: Request, res: Response) => {
        const envelopeRaw = gateLogoUpload(req, res);
        if (envelopeRaw === null) return;
        try {
            const thumbnail = req.file;
            if (thumbnail) writeSiteLogo(thumbnail.buffer, envelopeRaw);
            else writeEnvelope(envelopeRaw);
        } catch (err) {
            logger.warn?.(`[site] logo write failed err=${String(err)}`);
            res.status(HTTP_BAD_REQUEST).json({ error: "write_failed" });
            return;
        }
        res.json({ ok: true });
    });
})();

export default router;
