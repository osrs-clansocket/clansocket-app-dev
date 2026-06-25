import type { ImageDataLike } from "./raster-to-mesh/types/types-raster.js";

export async function toImageData(blob: Blob): Promise<ImageDataLike> {
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error(`toImageData: could not acquire 2d context (${bitmap.width}x${bitmap.height})`);
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}
