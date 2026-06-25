import type { Point2D } from "../types/types-geom.js";
import { findNextChain } from "./chain-adjacency.js";
import { EPSILON, type ChainState } from "./chain-state.js";

function stepChain(state: ChainState, currentIdx: number, ring: Point2D[]): number {
    if (state.visited.has(currentIdx)) return -1;
    state.visited.add(currentIdx);
    const seg = state.segments[currentIdx];
    ring.push({ x: seg.x2, y: seg.y2 });
    return findNextChain(state, seg.x2, seg.y2);
}

function closeChain(ring: Point2D[]): void {
    if (ring.length < 2) return;
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (Math.abs(first.x - last.x) < EPSILON && Math.abs(first.y - last.y) < EPSILON) {
        ring.pop();
    }
}

export function followChain(state: ChainState, startIdx: number): Point2D[] {
    const { segments } = state;
    const ring: Point2D[] = [{ x: segments[startIdx].x1, y: segments[startIdx].y1 }];
    let currentIdx = startIdx;
    const ringLimit = segments.length + 1;
    for (let step = 0; step < ringLimit; step++) {
        const nextIdx = stepChain(state, currentIdx, ring);
        if (nextIdx === -1) break;
        currentIdx = nextIdx;
    }
    closeChain(ring);
    return ring;
}
