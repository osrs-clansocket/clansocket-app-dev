import type { SampleGrid } from "../sample.js";
import { RGB_STRIDE } from "./voxelize-cell.js";
import { downsampleCells } from "./voxelize-downsample.js";
import type { VoxelGrid } from "./voxelize-types.js";
import { BORDER, computeDims } from "./voxelize-dims.js";
import { maskFromAlpha } from "./voxelize-mask.js";

export type { VoxelGrid } from "./voxelize-types.js";

export function voxelize(grid: SampleGrid, resolution: number, alphaThreshold: number): VoxelGrid {
    const { alpha: srcAlpha, rgb: srcRgb, width: srcW, height: srcH } = grid;
    const dims = computeDims(srcW, srcH, resolution);
    const { cellSize, coreW, coreH, outW, outH } = dims;
    const total = outW * outH;
    const alpha = new Float32Array(total);
    const rgb = new Float32Array(total * RGB_STRIDE);
    downsampleCells(
        { srcAlpha, srcRgb, srcW, srcH, cellSize },
        { dstAlpha: alpha, dstRgb: rgb, dstW: coreW, dstH: coreH, padW: outW, padOffsetX: BORDER, padOffsetY: BORDER },
    );
    return {
        alpha,
        rgb,
        cellSize,
        mask: maskFromAlpha(alpha, alphaThreshold),
        resolution: Math.max(outW, outH),
        aspectRatio: outW / outH,
        width: outW,
        height: outH,
        border: BORDER,
    };
}

export function gridDimensions(grid: VoxelGrid): { width: number; height: number } {
    return { width: grid.width, height: grid.height };
}
