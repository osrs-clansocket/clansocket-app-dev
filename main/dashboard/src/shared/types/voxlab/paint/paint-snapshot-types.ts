import type { PartsPaintState } from "./paint-parts-types.js";

export interface PaintOverride {
    vertexIndex: number;
    rgb: [number, number, number];
}

export interface PaintSnapshotState {
    parts: PartsPaintState;
    overrides: PaintOverride[];
}

export interface PaintClearAll {
    timestamp: number;
}
