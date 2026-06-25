import sharp from "sharp";
import { ICON_PNG_COMPRESSION_LEVEL, ICON_WEBP_ALPHA_QUALITY, ICON_WEBP_QUALITY } from "./quality.js";
import { ICON_BAKE_SIZE, TRANSPARENT_RGBA, type CustomizeTransform } from "./transform.js";
import { transformPristine } from "./transform-pristine.js";
import { roundedMask } from "./rounded-mask.js";

export const SHARP_READABLE_EXTS: ReadonlySet<string> = new Set([".webp", ".png", ".jpg", ".svg"]);

interface OverlayWindow {
    cropLeft: number;
    cropTop: number;
    compositeLeft: number;
    compositeTop: number;
    compositeWidth: number;
    compositeHeight: number;
}

function computeOverlayWindow(rawLeft: number, rawTop: number, tW: number, tH: number): OverlayWindow {
    const cropLeft = Math.max(0, -rawLeft);
    const cropTop = Math.max(0, -rawTop);
    const compositeLeft = Math.max(0, rawLeft);
    const compositeTop = Math.max(0, rawTop);
    const compositeWidth = Math.min(tW - cropLeft, ICON_BAKE_SIZE - compositeLeft);
    const compositeHeight = Math.min(tH - cropTop, ICON_BAKE_SIZE - compositeTop);
    return { cropLeft, cropTop, compositeLeft, compositeTop, compositeWidth, compositeHeight };
}

async function buildImageOverlay(buf: Buffer, tW: number, tH: number, w: OverlayWindow): Promise<sharp.OverlayOptions> {
    const cropMatchesBuffer =
        w.cropLeft === 0 && w.cropTop === 0 && w.compositeWidth === tW && w.compositeHeight === tH;
    const overlayBuffer = cropMatchesBuffer
        ? buf
        : await sharp(buf)
              .extract({ left: w.cropLeft, top: w.cropTop, width: w.compositeWidth, height: w.compositeHeight })
              .toBuffer();
    return { input: overlayBuffer, top: w.compositeTop, left: w.compositeLeft };
}

function emptyCanvas(): sharp.Sharp {
    return sharp({
        create: {
            width: ICON_BAKE_SIZE,
            height: ICON_BAKE_SIZE,
            channels: 4,
            background: TRANSPARENT_RGBA,
        },
    });
}

export async function bakeCustomizedIcon(
    pristineBuffer: Buffer,
    transform: CustomizeTransform,
    outFormat: "webp" | "png",
): Promise<Buffer> {
    const t = await transformPristine(pristineBuffer, transform);
    const rawLeft = Math.round((ICON_BAKE_SIZE - t.width) / 2 + transform.translateX);
    const rawTop = Math.round((ICON_BAKE_SIZE - t.height) / 2 + transform.translateY);
    const window = computeOverlayWindow(rawLeft, rawTop, t.width, t.height);
    const overlays: sharp.OverlayOptions[] = [];
    if (window.compositeWidth > 0 && window.compositeHeight > 0) {
        overlays.push(await buildImageOverlay(t.buffer, t.width, t.height, window));
    }
    overlays.push(roundedMask());
    const composed = emptyCanvas().composite(overlays);
    if (outFormat === "webp") {
        return composed.webp({ quality: ICON_WEBP_QUALITY, alphaQuality: ICON_WEBP_ALPHA_QUALITY }).toBuffer();
    }
    return composed.png({ compressionLevel: ICON_PNG_COMPRESSION_LEVEL }).toBuffer();
}
