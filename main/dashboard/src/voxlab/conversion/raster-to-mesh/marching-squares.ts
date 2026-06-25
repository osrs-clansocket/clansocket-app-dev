import type { EdgeSegment } from "./types/types-geom.js";
import { gridDimensions, type VoxelGrid } from "./voxelize/voxelize.js";
import { edgePoints, type MarchCorners } from "./marching-edges.js";

const ALL_CORNERS_MASK = 15;

const EDGE_TABLE: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
    [],
    [[3, 0]],
    [[0, 1]],
    [[3, 1]],
    [[1, 2]],
    [
        [3, 0],
        [1, 2],
    ],
    [[0, 2]],
    [[3, 2]],
    [[2, 3]],
    [[2, 0]],
    [
        [0, 1],
        [2, 3],
    ],
    [[2, 1]],
    [[1, 3]],
    [[1, 0]],
    [[0, 3]],
    [],
];

interface CornerInput {
    alpha: Float32Array;
    w: number;
    x: number;
    y: number;
}

function cornerAlpha(input: CornerInput): MarchCorners {
    const { alpha, w, x, y } = input;
    return {
        tl: alpha[y * w + x],
        tr: alpha[y * w + (x + 1)],
        br: alpha[(y + 1) * w + (x + 1)],
        bl: alpha[(y + 1) * w + x],
    };
}

export function marchingSquares(grid: VoxelGrid, alphaThreshold: number): EdgeSegment[] {
    const { width: w, height: h } = gridDimensions(grid);
    const { mask, alpha } = grid;
    const segments: EdgeSegment[] = [];
    for (let y = 0; y < h - 1; y++) {
        for (let x = 0; x < w - 1; x++) {
            const tl = mask[y * w + x];
            const tr = mask[y * w + (x + 1)];
            const br = mask[(y + 1) * w + (x + 1)];
            const bl = mask[(y + 1) * w + x];
            const code = tl | (tr << 1) | (br << 2) | (bl << 3);
            if (code === 0 || code === ALL_CORNERS_MASK) {
                continue;
            }
            const corners = cornerAlpha({ alpha, w, x, y });
            const edges = edgePoints({ x, y, corners, threshold: alphaThreshold });
            for (const [a, b] of EDGE_TABLE[code]) {
                segments.push({ x1: edges[a].x, y1: edges[a].y, x2: edges[b].x, y2: edges[b].y });
            }
        }
    }
    return segments;
}
