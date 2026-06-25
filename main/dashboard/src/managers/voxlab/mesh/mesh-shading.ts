import type { BufferAttribute, Mesh } from "three";
import type { MeshData } from "../../../shared/types/voxlab/mesh/mesh-types.js";

export function setShadingMode(mesh: Mesh, meshData: MeshData, smoothShading: boolean): void {
    const geometry = mesh.geometry;
    if (smoothShading) geometry.computeVertexNormals();
    else {
        const normalAttr = geometry.getAttribute("normal") as BufferAttribute;
        (normalAttr.array as Float32Array).set(meshData.normals);
        normalAttr.needsUpdate = true;
    }
}
