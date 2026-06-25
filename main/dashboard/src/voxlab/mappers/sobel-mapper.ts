import {
    BYTE_MAX_PBR,
    DEFAULT_SOBEL_STRENGTH,
    LUM_B,
    LUM_G,
    LUM_R,
    NORMAL_ENCODE_BIAS,
    POSITION_X_OFFSET,
    POSITION_Y_OFFSET,
    POSITION_Z_OFFSET,
    RGBA_STRIDE_PBR,
    SAMPLE_NEIGHBOR_OFFSET,
} from "../../shared/constants/voxlab/pbr-generation-constants.js";

function encodeNormalByte(component: number): number {
    return Math.round((component * NORMAL_ENCODE_BIAS + NORMAL_ENCODE_BIAS) * BYTE_MAX_PBR);
}

interface NormalPixelArgs {
    out: ImageData;
    idx: number;
    nx: number;
    ny: number;
    nz: number;
}

function writeNormalPixel(args: NormalPixelArgs): void {
    const { out, idx, nx, ny, nz } = args;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    out.data[idx] = encodeNormalByte(nx / len);
    out.data[idx + POSITION_X_OFFSET] = encodeNormalByte(ny / len);
    out.data[idx + POSITION_Y_OFFSET] = encodeNormalByte(nz / len);
    out.data[idx + POSITION_Z_OFFSET] = BYTE_MAX_PBR;
}

function sobelGradient(args: {
    lum: Float32Array;
    x: number;
    y: number;
    width: number;
    lastX: number;
    lastY: number;
}): { dx: number; dy: number } {
    const { lum, x, y, width, lastX, lastY } = args;
    const xR = Math.min(lastX, x + SAMPLE_NEIGHBOR_OFFSET);
    const xL = Math.max(0, x - SAMPLE_NEIGHBOR_OFFSET);
    const yD = Math.min(lastY, y + SAMPLE_NEIGHBOR_OFFSET);
    const yU = Math.max(0, y - SAMPLE_NEIGHBOR_OFFSET);
    const dx = (lum[y * width + xR] - lum[y * width + xL]) / (1 + SAMPLE_NEIGHBOR_OFFSET);
    const dy = (lum[yD * width + x] - lum[yU * width + x]) / (1 + SAMPLE_NEIGHBOR_OFFSET);
    return { dx, dy };
}

export function mapNormalSobel(image: ImageData, strengthOverride?: number): ImageData {
    const { width, height, data } = image;
    const out = new ImageData(width, height);
    const lum = computeNormalLum(data, width, height);
    const lastX = width - 1;
    const lastY = height - 1;
    const strength = strengthOverride ?? DEFAULT_SOBEL_STRENGTH;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const { dx, dy } = sobelGradient({ lum, x, y, width, lastX, lastY });
            writeNormalPixel({
                out,
                idx: (y * width + x) * RGBA_STRIDE_PBR,
                nx: -dx * strength,
                ny: -dy * strength,
                nz: 1,
            });
        }
    }
    return out;
}

function computeNormalLum(data: Uint8ClampedArray, width: number, height: number): Float32Array {
    const lum = new Float32Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += RGBA_STRIDE_PBR, j++) {
        lum[j] =
            (LUM_R * data[i] + LUM_G * data[i + POSITION_X_OFFSET] + LUM_B * data[i + POSITION_Y_OFFSET]) /
            BYTE_MAX_PBR;
    }
    return lum;
}
