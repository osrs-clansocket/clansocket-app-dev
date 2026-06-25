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
    if (ext === ".webp") {
        return pipeline.webp({ quality: ICON_WEBP_QUALITY, alphaQuality: ICON_WEBP_ALPHA_QUALITY }).toBuffer();
    }
    if (ext === ".jpg") return pipeline.jpeg({ quality: ICON_JPEG_QUALITY }).toBuffer();
    return pipeline.png({ compressionLevel: ICON_PNG_COMPRESSION_LEVEL }).toBuffer();
}
