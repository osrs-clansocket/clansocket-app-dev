import type { EdgeSegment } from "../types/types-geom.js";
import { chainQuantize } from "./chain-quantize.js";
import type { ChainState } from "./chain-state.js";

export function buildChainAdjacency(segments: EdgeSegment[]): Map<number, number[]> {
    const map = new Map<number, number[]>();
    for (let i = 0; i < segments.length; i++) {
        const key = chainQuantize(segments[i].x1, segments[i].y1);
        const list = map.get(key) ?? [];
        list.push(i);
        map.set(key, list);
    }
    return map;
}

export function findNextChain(state: ChainState, x: number, y: number): number {
    const candidates = state.adjacency.get(chainQuantize(x, y));
    if (!candidates) return -1;
    for (const idx of candidates) {
        if (!state.visited.has(idx)) return idx;
    }
    return -1;
}
