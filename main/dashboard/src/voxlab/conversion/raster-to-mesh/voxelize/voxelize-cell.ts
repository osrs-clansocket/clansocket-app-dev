import { accumulateCellRange } from "./voxelize-accumulate-range.js";
import type { CellAverage, SourceGrid } from "./voxelize-cell-types.js";

export { RGB_STRIDE } from "./voxelize-accum.js";
export type { CellAverage, SourceGrid } from "./voxelize-cell-types.js";

export function averageCell(source: SourceGrid, dx: number, dy: number): CellAverage {
    const sx0 = Math.floor(dx * source.cellSize);
    const sy0 = Math.floor(dy * source.cellSize);
    const sx1 = Math.min(source.srcW, Math.ceil((dx + 1) * source.cellSize));
    const sy1 = Math.min(source.srcH, Math.ceil((dy + 1) * source.cellSize));
    const a = accumulateCellRange({ source, sx0, sy0, sx1, sy1 });
    if (a.totalCount === 0) return { alpha: 0, r: 0, g: 0, b: 0 };
    const alpha = a.sumAlpha / a.totalCount;
    if (a.opaqueCount > 0) {
        return {
            alpha,
            r: a.sumOpaqueR / a.opaqueCount,
            g: a.sumOpaqueG / a.opaqueCount,
            b: a.sumOpaqueB / a.opaqueCount,
        };
    }
    return { alpha, r: a.sumAllR / a.totalCount, g: a.sumAllG / a.totalCount, b: a.sumAllB / a.totalCount };
}
