import {
    BYTE_MAX_PBR,
    POSITION_X_OFFSET,
    POSITION_Y_OFFSET,
    POSITION_Z_OFFSET,
    RGBA_STRIDE_PBR,
} from "../../shared/constants/voxlab/pbr-generation-constants.js";
import { averageLum, computeLuminanceBuffer } from "./local-contrast-lum.js";

export function localContrastMapper(image: ImageData, radius: number): ImageData {
    const { width, height, data } = image;
    const out = new ImageData(width, height);
    const r = Math.max(1, Math.floor(radius));
    const lum = computeLuminanceBuffer(data, width * height);
    const lastX = width - 1;
    const lastY = height - 1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const avg = averageLum({ lum, width, x, y, r, lastX, lastY });
            const centerLum = lum[y * width + x];
            const ratio = avg === 0 ? 1 : centerLum / avg;
            const aoValue = Math.max(0, Math.min(BYTE_MAX_PBR, Math.round(ratio * BYTE_MAX_PBR)));
            const idx = (y * width + x) * RGBA_STRIDE_PBR;
            out.data[idx] = aoValue;
            out.data[idx + POSITION_X_OFFSET] = aoValue;
            out.data[idx + POSITION_Y_OFFSET] = aoValue;
            out.data[idx + POSITION_Z_OFFSET] = BYTE_MAX_PBR;
        }
    }
    return out;
}
