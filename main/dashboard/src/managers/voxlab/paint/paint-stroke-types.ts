import type { MeshPart } from "../../../shared/types/voxlab/paint/paint-types.js";

export interface VertexRange {
    vertices: Set<number>;
    minV: number;
    maxV: number;
}

export type RgbTuple = [number, number, number];

export interface StrokeDelta {
    overrides: Map<number, [RgbTuple | null, RgbTuple | null]>;
    parts: Partial<Record<MeshPart, [string | null, string | null]>>;
}
