import type { Point2D } from "../types/types-geom.js";

const MIN_RING_VERTS = 3;
const CHAIKIN_NEAR_WEIGHT = 0.75;
const CHAIKIN_FAR_WEIGHT = 0.25;

function chaikinPass(ring: Point2D[]): Point2D[] {
    if (ring.length < MIN_RING_VERTS) return ring;
    const out: Point2D[] = [];
    for (let i = 0; i < ring.length; i++) {
        const p0 = ring[i];
        const p1 = ring[(i + 1) % ring.length];
        out.push({
            x: CHAIKIN_NEAR_WEIGHT * p0.x + CHAIKIN_FAR_WEIGHT * p1.x,
            y: CHAIKIN_NEAR_WEIGHT * p0.y + CHAIKIN_FAR_WEIGHT * p1.y,
        });
        out.push({
            x: CHAIKIN_FAR_WEIGHT * p0.x + CHAIKIN_NEAR_WEIGHT * p1.x,
            y: CHAIKIN_FAR_WEIGHT * p0.y + CHAIKIN_NEAR_WEIGHT * p1.y,
        });
    }
    return out;
}

export function chaikinSmooth(ring: Point2D[], passes: number): Point2D[] {
    let current = ring;
    for (let i = 0; i < passes; i++) current = chaikinPass(current);
    return current;
}
