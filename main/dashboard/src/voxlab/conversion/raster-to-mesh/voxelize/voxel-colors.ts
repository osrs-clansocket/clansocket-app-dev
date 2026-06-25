import type { VoxelGrid } from "./voxelize.js";
import { nearestColorSrc } from "./voxel-nearest-color.js";
import { writeRgb } from "./voxel-write-rgb.js";

const POSITION_STRIDE = 3;
const RGB_STRIDE = 3;

export function voxelColors(positions: Float32Array, voxel: VoxelGrid): Float32Array {
    const vertexCount = positions.length / POSITION_STRIDE;
    const out = new Float32Array(vertexCount * RGB_STRIDE);
    const { width, height, rgb, mask } = voxel;
    const lastX = width - 1;
    const lastY = height - 1;
    for (let i = 0; i < vertexCount; i++) {
        const cellX = Math.max(0, Math.min(lastX, Math.floor(positions[i * POSITION_STRIDE])));
        const cellY = Math.max(0, Math.min(lastY, Math.floor(positions[i * POSITION_STRIDE + 1])));
        const cellIdx = cellY * width + cellX;
        const outBase = i * RGB_STRIDE;
        if (mask[cellIdx] === 1) {
            writeRgb(out, outBase, rgb, cellIdx * RGB_STRIDE);
            continue;
        }
        const sourceIdx = nearestColorSrc({ mask, width, cellX, cellY, lastX, lastY });
        if (sourceIdx !== -1) writeRgb(out, outBase, rgb, sourceIdx * RGB_STRIDE);
    }
    return out;
}
