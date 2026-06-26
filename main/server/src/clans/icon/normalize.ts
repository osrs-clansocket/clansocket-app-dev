import sharp from "sharp";
import {
    ICON_JPEG_QUALITY,
    ICON_PNG_COMPRESSION_LEVEL,
    ICON_WEBP_ALPHA_QUALITY,
    ICON_WEBP_QUALITY,
} from "./quality.js";

const ICON_RESIZE_LONGER_SIDE = 1024;
const RASTER_RESIZABLE_EXTS = new Set([".png", ".jpg", ".webp"]);

export async function normalizeUploadedIcon(buffer: Buffer, ext: string): Promise<Buffer> {
    if (!RASTER_RESIZABLE_EXTS.has(ext)) return buffer;
    const meta = await sharp(buffer, { failOn: "none" }).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const longer = Math.max(w, h);
    if (longer <= ICON_RESIZE_LONGER_SIDE) return buffer;
    const pipeline = sharp(buffer, { failOn: "none" }).resize({
        width: w >= h ? ICON_RESIZE_LONGER_SIDE : undefined,
        height: h > w ? ICON_RESIZE_LONGER_SIDE : undefined,
        fit: "inside",
        withoutEnlargement: true,
    });
    const ENCODERS: Record<string, (p: sharp.Sharp) => sharp.Sharp> = {
        ".webp": (p) => p.webp({ quality: ICON_WEBP_QUALITY, alphaQuality: ICON_WEBP_ALPHA_QUALITY }),
        ".jpg": (p) => p.jpeg({ quality: ICON_JPEG_QUALITY }),
    };
    const encode = ENCODERS[ext] ?? ((p) => p.png({ compressionLevel: ICON_PNG_COMPRESSION_LEVEL }));
    return encode(pipeline).toBuffer();
}
