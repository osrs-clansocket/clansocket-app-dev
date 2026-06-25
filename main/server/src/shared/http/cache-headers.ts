import { type Request, type Response } from "express";

export const HEADER_CACHE_CONTROL = "Cache-Control";

const CACHE_REVALIDATE = "public, max-age=0, must-revalidate";

export { applyVersionedCache, handledNotModified } from "./cache-versioning.js";

export function acceptsBrotli(req: Request): boolean {
    const enc = req.headers["accept-encoding"];
    return typeof enc === "string" && enc.includes("br");
}

export function setRevalidateCache(res: Response): void {
    res.setHeader(HEADER_CACHE_CONTROL, CACHE_REVALIDATE);
}
