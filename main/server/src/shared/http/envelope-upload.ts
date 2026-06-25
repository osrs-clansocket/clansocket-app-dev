import { type Request, type Response } from "express";
import multer, { type Multer } from "multer";
import { FIFTY_MB_BYTES, FIVE_MB_BYTES } from "../byte-units.js";
import { HTTP_BAD_REQUEST } from "./http-status.js";
import { isString } from "../validators/type-guards.js";

export const ENVELOPE_THUMBNAIL_MAX_BYTES = FIVE_MB_BYTES;
export const ENVELOPE_BODY_MAX_BYTES = FIFTY_MB_BYTES;

export function thumbnailUploader(field: string): ReturnType<Multer["single"]> {
    return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: ENVELOPE_THUMBNAIL_MAX_BYTES, fieldSize: ENVELOPE_BODY_MAX_BYTES },
    }).single(field);
}

export function extractEnvelope(req: Request, res: Response): string | null {
    const envelopeRaw = isString(req.body?.envelope) ? req.body.envelope : "";
    if (envelopeRaw.length === 0) {
        res.status(HTTP_BAD_REQUEST).json({ error: "no_envelope" });
        return null;
    }
    try {
        JSON.parse(envelopeRaw);
    } catch {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_envelope" });
        return null;
    }
    return envelopeRaw;
}
