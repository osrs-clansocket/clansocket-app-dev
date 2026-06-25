import type { PositionRow, PositionsMapMeta } from "../../../../../state/clans/stores/positions-store.js";
import { rowToPx } from "../mappers/coordinate-mapper.js";

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

function expand(bounds: Bounds, x: number, y: number): void {
    if (x < bounds.minX) bounds.minX = x;
    if (x > bounds.maxX) bounds.maxX = x;
    if (y < bounds.minY) bounds.minY = y;
    if (y > bounds.maxY) bounds.maxY = y;
}

export function computeRowBounds(rows: readonly PositionRow[], meta: PositionsMapMeta): Bounds {
    const bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    for (const row of rows) {
        const { ix, iy } = rowToPx(row, meta);
        expand(bounds, ix, iy);
    }
    return bounds;
}
