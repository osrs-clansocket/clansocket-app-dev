import type { Point2D } from "../raster-to-mesh/types/types-geom.js";
import { MIN_SEGMENT_LENGTH } from "./constants/defaults.js";
import type { ParseState } from "./path-parse-state.js";

const MIN_RING_VERTS = 3;

function removeDegenerate(ring: Point2D[]): Point2D[] {
    if (ring.length < 2) return ring;
    const out: Point2D[] = [ring[0]];
    const minSq = MIN_SEGMENT_LENGTH * MIN_SEGMENT_LENGTH;
    for (let i = 1; i < ring.length; i++) {
        const prev = out[out.length - 1];
        const curr = ring[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        if (dx * dx + dy * dy >= minSq) out.push(curr);
    }
    return out;
}

export function finalizeCurrent(state: ParseState): void {
    if (state.current.length < MIN_RING_VERTS) return;
    const cleaned = removeDegenerate(state.current);
    if (cleaned.length >= MIN_RING_VERTS) state.rings.push(cleaned);
    state.current = [];
}
