import type { Mesh } from "three";
import type { MeshPart } from "../../../../shared/types/voxlab/paint/paint-types.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { VertexRange } from "../paint-manager-types.js";

function partIndexRange(
    part: MeshPart,
    boundaries: { frontIndexEnd: number; backIndexEnd: number; sideIndexEnd: number },
): { startIdx: number; endIdx: number } {
    if (part === "front") return { startIdx: 0, endIdx: boundaries.frontIndexEnd };
    if (part === "back") return { startIdx: boundaries.frontIndexEnd, endIdx: boundaries.backIndexEnd };
    return { startIdx: boundaries.backIndexEnd, endIdx: boundaries.sideIndexEnd };
}

export function computeRange(meshes: MeshManager, part: MeshPart): VertexRange | null {
    const meshData = meshes.meshData;
    if (!meshData) return null;
    const boundaries = meshData.metadata.groupBoundaries;
    if (!boundaries) return null;
    const mesh: Mesh | null = meshes.mesh;
    if (!mesh) return null;
    const indices = mesh.geometry.getIndex();
    if (!indices) return null;
    const { startIdx, endIdx } = partIndexRange(part, boundaries);
    const vertices = new Set<number>();
    let minV = Infinity;
    let maxV = -Infinity;
    for (let i = startIdx; i < endIdx; i++) {
        const v = indices.getX(i);
        vertices.add(v);
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }
    if (minV === Infinity) return null;
    return { vertices, minV, maxV };
}
