import { Mesh, type Material } from "three";
import { meshGeometry } from "../../../voxlab/formatters/geometry-formatter.js";
import type { MeshData } from "../../../shared/types/voxlab/mesh/mesh-types.js";

export interface BuildMeshOpts {
    meshData: MeshData;
    smoothShading: boolean;
    castShadows: boolean;
    materials: Material[];
}

export function buildMesh(opts: BuildMeshOpts): Mesh {
    const geometry = meshGeometry(opts.meshData, opts.smoothShading);
    if (typeof geometry.computeBoundsTree === "function") geometry.computeBoundsTree();
    const mesh = new Mesh(geometry, opts.materials);
    mesh.castShadow = opts.castShadows;
    mesh.receiveShadow = opts.castShadows;
    return mesh;
}
