import type { Vector3 } from "three";
import type { BrushState } from "../../../../shared/types/voxlab/paint/paint-types.js";

function mirrorBrushAlong(axis: "X" | "Y" | "Z", count: number, symmetryPoints: Vector3[]): number {
    const existing = count;
    for (let i = 0; i < existing; i++) {
        const src = symmetryPoints[i];
        const dst = symmetryPoints[count];
        if (axis === "X") dst.set(-src.x, src.y, src.z);
        else if (axis === "Y") dst.set(src.x, -src.y, src.z);
        else dst.set(src.x, src.y, -src.z);
        count++;
    }
    return count;
}

export function gatherBrushSymmetry(worldPoint: Vector3, brush: BrushState, symmetryPoints: Vector3[]): number {
    symmetryPoints[0].copy(worldPoint);
    let count = 1;
    if (brush.mirrorX) count = mirrorBrushAlong("X", count, symmetryPoints);
    if (brush.mirrorY) count = mirrorBrushAlong("Y", count, symmetryPoints);
    if (brush.mirrorZ) count = mirrorBrushAlong("Z", count, symmetryPoints);
    return count;
}
