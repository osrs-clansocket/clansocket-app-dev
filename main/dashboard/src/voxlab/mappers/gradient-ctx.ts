import type { BufferAttribute, Color, Vector3 } from "three";
import type { GradientStop } from "../../shared/types/voxlab/paint/paint-types.js";

export interface GradientCtx {
    positions: BufferAttribute;
    targetVertices: ReadonlySet<number>;
    sortedStops: ReadonlyArray<GradientStop>;
    stopColors: ReadonlyArray<Color>;
    scratch: Vector3;
}
