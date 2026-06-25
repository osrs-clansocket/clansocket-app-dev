import { type BufferAttribute, type Vector3 } from "three";
import type { BrushState } from "../../../../shared/types/voxlab/paint/paint-types.js";
import { brushMapper, type VertexHashGrid } from "../../../../voxlab/mappers/brush-mapper.js";

export function brushHitsPoint(
    brush: BrushState,
    vertexGrid: VertexHashGrid | null,
    args: {
        p: Vector3;
        positions: BufferAttribute;
        normals: BufferAttribute | undefined;
        cameraPos: Vector3 | undefined;
    },
): ReadonlyArray<{ vertexIndex: number; weight: number }> {
    const { p, positions, normals, cameraPos } = args;
    const candidates = vertexGrid !== null ? vertexGrid.queryRadius(p, brush.radius) : null;
    return brushMapper({
        positions,
        hitWorldPoint: p,
        radius: brush.radius,
        falloffSigma: brush.falloffSigma,
        candidateIndices: candidates,
        options: { normals, cameraPos, hideBackFaces: brush.hideBackFaces },
    });
}
