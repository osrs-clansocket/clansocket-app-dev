import type { Polygon } from "./types/types-geom.js";

export function flattenPolygon(polygon: Polygon): { flat: number[]; holeIndices: number[]; count: number } {
    const flat: number[] = [];
    for (const p of polygon.outer) {
        flat.push(p.x, p.y);
    }
    const holeIndices: number[] = [];
    for (const hole of polygon.holes) {
        holeIndices.push(flat.length / 2);
        for (const p of hole) {
            flat.push(p.x, p.y);
        }
    }
    return { flat, holeIndices, count: flat.length / 2 };
}
