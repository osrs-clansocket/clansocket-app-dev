import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { TEN_MB_BYTES } from "../../shared/byte-units.js";
import { HTTP_BAD_REQUEST } from "../../shared/http/http-status.js";

export const ICON_MIME_EXT: Record<string, string> = {
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "image/jpeg": ".jpg",
};
const ICON_MAX_BYTES = TEN_MB_BYTES;

const iconUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: ICON_MAX_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (ICON_MIME_EXT[file.mimetype]) cb(null, true);
        else cb(null, false);
    },
});

export function handleUpload(req: Request, res: Response, next: NextFunction): void {
    iconUpload.single("icon")(req, res, (err: unknown) => {
        if (err) {
            const code = (err as { code?: string }).code;
            if (code === "LIMIT_FILE_SIZE") {
                res.status(HTTP_BAD_REQUEST).json({ error: "too_large", maxBytes: ICON_MAX_BYTES });
                return;
            }
            res.status(HTTP_BAD_REQUEST).json({ error: "upload_failed" });
            return;
        }
        next();
    });
}
