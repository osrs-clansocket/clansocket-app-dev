import type { Point2D } from "../types/types-geom.js";
import { ringSignedArea } from "./ring-area.js";

export function normalizeRingDirection(ring: Point2D[], wantOuter: boolean): Point2D[] {
    const currentlyOuterDir = ringSignedArea(ring) < 0;
    return currentlyOuterDir === wantOuter ? ring : ring.slice().reverse();
}
