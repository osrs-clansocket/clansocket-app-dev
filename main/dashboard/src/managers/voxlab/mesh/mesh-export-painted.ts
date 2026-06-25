import type { BufferAttribute, Mesh } from "three";
import type { MeshData } from "../../../shared/types/voxlab/mesh/mesh-types.js";

export function exportPainted(meshData: MeshData, mesh: Mesh): MeshData {
    const colorAttr = mesh.geometry.getAttribute("color") as BufferAttribute | undefined;
    if (!colorAttr) return meshData;
    return { ...meshData, colors: new Float32Array(colorAttr.array) };
}
