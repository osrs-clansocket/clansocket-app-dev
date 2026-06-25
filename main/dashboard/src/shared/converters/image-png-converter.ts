import { scratchCanvas } from "../../dom/factory/content-ops/index.js";
import { loadImage } from "./image-load.js";
import { drawCentered } from "./image-draw-centered.js";
import { canvasToBlob } from "./image-canvas-blob.js";

const THUMBNAIL_TARGET_PX = 512;

export async function imageToPng(file: File): Promise<Blob> {
    const url = URL.createObjectURL(file);
    try {
        const img = await loadImage(url);
        const canvas = scratchCanvas({
            width: THUMBNAIL_TARGET_PX,
            height: THUMBNAIL_TARGET_PX,
            context: null,
            meta: null,
        }).el;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error(`imageToPng: canvas context unavailable (${THUMBNAIL_TARGET_PX}x${THUMBNAIL_TARGET_PX})`);
        drawCentered(ctx, img);
        return await canvasToBlob(canvas);
    } finally {
        URL.revokeObjectURL(url);
    }
}
