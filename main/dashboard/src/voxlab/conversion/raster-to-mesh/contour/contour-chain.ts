import type { EdgeSegment, Point2D } from "../types/types-geom.js";
import { buildChainAdjacency } from "../chain/chain-adjacency.js";
import { followChain } from "../chain/chain-follow.js";
import { MIN_RING_VERTS, type ChainState } from "../chain/chain-state.js";

export function chainSegments(segments: EdgeSegment[]): Point2D[][] {
    const adjacency = buildChainAdjacency(segments);
    const visited = new Set<number>();
    const rings: Point2D[][] = [];
    const state: ChainState = { segments, adjacency, visited };
    for (let i = 0; i < segments.length; i++) {
        if (visited.has(i)) continue;
        const ring = followChain(state, i);
        if (ring.length >= MIN_RING_VERTS) rings.push(ring);
    }
    return rings;
}
