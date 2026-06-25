import earcut from "earcut";
import type { Polygon } from "./types/types-geom.js";
import { flattenPolygon } from "./triangulate-flatten.js";
import type { PolygonFace } from "./polygon-face-types.js";
import { recordRingBoundaries } from "./record-ring-boundaries.js";

export type { PolygonFace } from "./polygon-face-types.js";

export function triangulatePolygon(polygons: Polygon[]): PolygonFace {
    const positions: number[] = [];
    const indices: number[] = [];
    const polygonStarts: number[] = [];
    const polygonEnds: number[] = [];
    let vertexOffset = 0;
    for (const polygon of polygons) {
        const polyStart = vertexOffset;
        const { flat, holeIndices, count } = flattenPolygon(polygon);
        const tri = earcut(flat, holeIndices, 2);
        for (let i = 0; i < count; i++) positions.push(flat[i * 2], flat[i * 2 + 1]);
        for (const localIdx of tri) indices.push(polyStart + localIdx);
        recordRingBoundaries(polygon, polyStart, polygonStarts, polygonEnds);
        vertexOffset += count;
    }
    return {
        positions: Float32Array.from(positions),
        indices: Uint32Array.from(indices),
        polygonStarts,
        polygonEnds,
    };
}
