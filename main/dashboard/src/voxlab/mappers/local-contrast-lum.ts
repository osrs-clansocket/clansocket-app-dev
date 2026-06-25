import {
    BYTE_MAX_PBR,
    LUM_B,
    LUM_G,
    LUM_R,
    POSITION_X_OFFSET,
    POSITION_Y_OFFSET,
    RGBA_STRIDE_PBR,
} from "../../shared/constants/voxlab/pbr-generation-constants.js";

export function computeLuminanceBuffer(data: Uint8ClampedArray, size: number): Float32Array {
    const lum = new Float32Array(size);
    for (let i = 0, j = 0; i < data.length; i += RGBA_STRIDE_PBR, j++) {
        lum[j] =
            (LUM_R * data[i] + LUM_G * data[i + POSITION_X_OFFSET] + LUM_B * data[i + POSITION_Y_OFFSET]) /
            BYTE_MAX_PBR;
    }
    return lum;
}

interface AverageLumArgs {
    lum: Float32Array;
    width: number;
    x: number;
    y: number;
    r: number;
    lastX: number;
    lastY: number;
}

export function averageLum(args: AverageLumArgs): number {
    const { lum, width, x, y, r, lastX, lastY } = args;
    let sum = 0;
    let count = 0;
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            const nx = Math.max(0, Math.min(lastX, x + dx));
            const ny = Math.max(0, Math.min(lastY, y + dy));
            sum += lum[ny * width + nx];
            count++;
        }
    }
    return sum / count;
}
