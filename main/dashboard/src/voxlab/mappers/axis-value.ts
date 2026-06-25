import type { Vector3 } from "three";
import type { GradientAxis } from "../../shared/types/voxlab/paint/paint-types.js";

export function getAxisValue(v: Vector3, axis: GradientAxis): number {
    if (axis === "x") return v.x;
    if (axis === "y") return v.y;
    return v.z;
}
