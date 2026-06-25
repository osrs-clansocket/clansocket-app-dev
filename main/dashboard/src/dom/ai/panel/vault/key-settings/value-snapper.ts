import { SNAP_POINTS, SNAP_TOLERANCE } from "./constants.js";

export function applyNearSnap(value: number): number {
    for (const point of SNAP_POINTS) {
        if (Math.abs(value - point) < SNAP_TOLERANCE) return point;
    }
    return value;
}
