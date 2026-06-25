import type { BufferAttribute, Vector3 } from "three";
import type { GradientAxis } from "../../shared/types/voxlab/paint/paint-types.js";
import { getAxisValue } from "./axis-value.js";

export function axisRange(
    positions: BufferAttribute,
    targetVertices: ReadonlySet<number>,
    axis: GradientAxis,
    scratch: Vector3,
): { min: number; max: number } {
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const idx of targetVertices) {
        scratch.fromBufferAttribute(positions, idx);
        const val = getAxisValue(scratch, axis);
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
    }
    return { min: minVal, max: maxVal };
}
