import type { Polygon } from "./types/types-geom.js";

export function recordRingBoundaries(
    polygon: Polygon,
    polyStart: number,
    polygonStarts: number[],
    polygonEnds: number[],
): void {
    const outerCount = polygon.outer.length;
    polygonStarts.push(polyStart);
    polygonEnds.push(polyStart + outerCount);
    let holeOffset = outerCount;
    for (const hole of polygon.holes) {
        polygonStarts.push(polyStart + holeOffset);
        polygonEnds.push(polyStart + holeOffset + hole.length);
        holeOffset += hole.length;
    }
}
