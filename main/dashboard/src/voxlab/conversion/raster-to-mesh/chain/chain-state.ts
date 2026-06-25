import type { EdgeSegment } from "../types/types-geom.js";

export const EPSILON = 1e-6;
export const MIN_RING_VERTS = 3;

export interface ChainState {
    segments: EdgeSegment[];
    adjacency: Map<number, number[]>;
    visited: Set<number>;
}
