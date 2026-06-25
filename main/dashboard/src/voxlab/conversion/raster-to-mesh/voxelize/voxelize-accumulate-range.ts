import { addAccumPixel, emptyAccum, type CellAccum } from "./voxelize-accum.js";
import type { SourceGrid } from "./voxelize-cell-types.js";

interface CellRangeArgs {
    source: SourceGrid;
    sx0: number;
    sy0: number;
    sx1: number;
    sy1: number;
}

export function accumulateCellRange(args: CellRangeArgs): CellAccum {
    const { source, sx0, sy0, sx1, sy1 } = args;
    const a = emptyAccum();
    for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
            addAccumPixel(a, source.srcAlpha, source.srcRgb, sy * source.srcW + sx);
        }
    }
    return a;
}
