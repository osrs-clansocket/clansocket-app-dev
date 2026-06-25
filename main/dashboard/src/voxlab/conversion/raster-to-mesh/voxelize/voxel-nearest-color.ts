import { findInRing } from "./voxel-ring-find.js";

const MAX_CELL_SEARCH_RADIUS = 16;

interface NearestColorArgs {
    mask: Uint8Array;
    width: number;
    cellX: number;
    cellY: number;
    lastX: number;
    lastY: number;
}

export function nearestColorSrc(args: NearestColorArgs): number {
    const { mask, width, cellX, cellY, lastX, lastY } = args;
    for (let r = 1; r <= MAX_CELL_SEARCH_RADIUS; r++) {
        const idx = findInRing({ mask, width, cellX, cellY, r, lastX, lastY });
        if (idx !== -1) return idx;
    }
    return -1;
}
