import type { Point2D } from "../types/types-geom.js";

export function ringSignedArea(ring: Point2D[]): number {
    let sum = 0;
    for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        sum += a.x * b.y - b.x * a.y;
    }
    return sum / 2;
}
