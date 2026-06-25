import sharp from "sharp";
import { ICON_BAKE_SIZE } from "./transform.js";

const ICON_BAKE_RADIUS = 55;

export function roundedMask(): sharp.OverlayOptions {
    const mask = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_BAKE_SIZE}" height="${ICON_BAKE_SIZE}">` +
            `<rect x="0" y="0" width="${ICON_BAKE_SIZE}" height="${ICON_BAKE_SIZE}" rx="${ICON_BAKE_RADIUS}" ry="${ICON_BAKE_RADIUS}" fill="#fff"/>` +
            `</svg>`,
    );
    return { input: mask, blend: "dest-in" };
}
