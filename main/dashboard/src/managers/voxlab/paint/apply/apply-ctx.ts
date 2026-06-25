import type { BufferAttribute } from "three";
import type { MeshPart, PartsPaintState } from "../../../../shared/types/voxlab/paint/paint-types.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { RgbTuple, VertexRange } from "../paint-manager-types.js";

export interface ApplyCtx {
    meshes: MeshManager;
    baselineColors: Float32Array | null;
    partsState: PartsPaintState;
    overridesMap: Map<number, RgbTuple>;
    rangeOf: (part: MeshPart) => VertexRange | null;
}

export function requireColorAttribute(meshes: MeshManager): BufferAttribute | null {
    const mesh = meshes.mesh;
    if (!mesh) return null;
    const attr = mesh.geometry.getAttribute("color") as BufferAttribute | undefined;
    return attr ?? null;
}
