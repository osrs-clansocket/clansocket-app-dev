import type { Point2D } from "../types/types-geom.js";

export function pointInRing(point: Point2D, ring: Point2D[]): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i++) {
        const a = ring[i];
        const b = ring[j];
        const intersects =
            a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
        if (intersects) inside = !inside;
    }
    return inside;
}
