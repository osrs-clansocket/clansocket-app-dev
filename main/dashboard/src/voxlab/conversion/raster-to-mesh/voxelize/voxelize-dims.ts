import type { VoxelDims } from "./voxelize-types.js";

export const BORDER = 1;

export function computeDims(srcW: number, srcH: number, resolution: number): VoxelDims {
    const cellSize = Math.max(srcW, srcH) / resolution;
    const coreW = Math.max(1, Math.round(srcW / cellSize));
    const coreH = Math.max(1, Math.round(srcH / cellSize));
    return { cellSize, coreW, coreH, outW: coreW + BORDER * 2, outH: coreH + BORDER * 2 };
}
