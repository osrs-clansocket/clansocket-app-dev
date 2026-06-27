import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { HTTP_BAD_REQUEST } from "../../shared/http/http-status.js";

const FOUR_MB_BYTES = 4 * 1024 * 1024;

export const HOMEPAGE_IMAGE_MIME_EXT: Record<string, string> = {
    "image/png": ".png",
    "image/webp": ".webp",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
};

const homepageImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: FOUR_MB_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (HOMEPAGE_IMAGE_MIME_EXT[file.mimetype]) cb(null, true);
        else cb(null, false);
    },
});

export const HOMEPAGE_IMAGE_MAX_BYTES = FOUR_MB_BYTES;

export function handleHomepageImageUpload(req: Request, res: Response, next: NextFunction): void {
    homepageImageUpload.single("image")(req, res, (err: unknown) => {
        if (err) {
            const code = (err as { code?: string }).code;
            if (code === "LIMIT_FILE_SIZE") {
                res.status(HTTP_BAD_REQUEST).json({ error: "too_large", maxBytes: FOUR_MB_BYTES });
                return;
            }
            res.status(HTTP_BAD_REQUEST).json({ error: "upload_failed" });
            return;
        }
        next();
    });
}
