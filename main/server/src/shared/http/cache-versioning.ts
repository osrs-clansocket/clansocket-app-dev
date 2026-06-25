import { type Request, type Response } from "express";
import { HEADER_CACHE_CONTROL } from "./cache-headers.js";
import { HTTP_NOT_MODIFIED } from "./http-status.js";

const CACHE_IMMUTABLE = "public, max-age=31536000, immutable";
const CACHE_REVALIDATE = "public, max-age=0, must-revalidate";

export function applyVersionedCache(req: Request, res: Response, version: string): string {
    const etag = `"${version}"`;
    res.setHeader("ETag", etag);
    const matched = typeof req.query.v === "string" && req.query.v === version;
    res.setHeader(HEADER_CACHE_CONTROL, matched ? CACHE_IMMUTABLE : CACHE_REVALIDATE);
    return etag;
}

export function handledNotModified(req: Request, res: Response, etag: string): boolean {
    if (req.headers["if-none-match"] !== etag) return false;
    res.status(HTTP_NOT_MODIFIED).end();
    return true;
}
