import { averageCell, RGB_STRIDE, type SourceGrid } from "./voxelize-cell.js";

export interface DestinationGrid {
    dstAlpha: Float32Array;
    dstRgb: Float32Array;
    dstW: number;
    dstH: number;
    padW: number;
    padOffsetX: number;
    padOffsetY: number;
}

export function downsampleCells(source: SourceGrid, dest: DestinationGrid): void {
    for (let dy = 0; dy < dest.dstH; dy++) {
        for (let dx = 0; dx < dest.dstW; dx++) {
            const outIdx = (dy + dest.padOffsetY) * dest.padW + (dx + dest.padOffsetX);
            const cell = averageCell(source, dx, dy);
            dest.dstAlpha[outIdx] = cell.alpha;
            const rgbOut = outIdx * RGB_STRIDE;
            dest.dstRgb[rgbOut] = cell.r;
            dest.dstRgb[rgbOut + 1] = cell.g;
            dest.dstRgb[rgbOut + 2] = cell.b;
        }
    }
}
