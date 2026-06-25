import sharp from "sharp";
import { ICON_BAKE_SIZE, TRANSPARENT_RGBA, type CustomizeTransform } from "./transform.js";

export interface TransformedIcon {
    buffer: Buffer;
    width: number;
    height: number;
}

export async function transformPristine(pristine: Buffer, transform: CustomizeTransform): Promise<TransformedIcon> {
    const sourceMeta = await sharp(pristine, { failOn: "none" }).metadata();
    const srcW = sourceMeta.width ?? ICON_BAKE_SIZE;
    const srcH = sourceMeta.height ?? ICON_BAKE_SIZE;
    const factor = (ICON_BAKE_SIZE * transform.scale) / Math.max(srcW, srcH);
    const scaledW = Math.max(1, Math.round(srcW * factor));
    const scaledH = Math.max(1, Math.round(srcH * factor));
    const buffer = await sharp(pristine, { failOn: "none" })
        .resize(scaledW, scaledH, { fit: "fill" })
        .rotate(transform.rotate, { background: TRANSPARENT_RGBA })
        .png()
        .toBuffer();
    const meta = await sharp(buffer).metadata();
    return { buffer, width: meta.width ?? scaledW, height: meta.height ?? scaledH };
}
