import { BufferAttribute, BufferGeometry } from "three";
import type { MeshData } from "../../shared/types/voxlab/mesh/mesh-types.js";
import { addGeometryGroups } from "./geometry-groups.js";
import { asFloat32, asUint32, copyFloat32 } from "./geometry-array-cast.js";
import { generateUvs } from "./geometry-uvs.js";
import { applySmoothShading } from "./geometry-smooth-shading.js";

export { MATERIAL_GROUP_FRONT_BACK, MATERIAL_GROUP_SIDES } from "./geometry-groups.js";

const STRIDE_3D = 3;

export function meshGeometry(meshData: MeshData, smoothShading: boolean): BufferGeometry {
    let geometry = new BufferGeometry();
    const positions = asFloat32(meshData.positions);
    /* eslint-disable lvi/no-raw-dom -- three.js BufferGeometry.setAttribute, not DOM */
    geometry.setAttribute("position", new BufferAttribute(positions, STRIDE_3D));
    geometry.setAttribute("normal", new BufferAttribute(copyFloat32(meshData.normals), STRIDE_3D));
    geometry.setAttribute("color", new BufferAttribute(copyFloat32(meshData.colors), STRIDE_3D));
    const uvs = meshData.uvs !== undefined ? asFloat32(meshData.uvs) : generateUvs(positions);
    geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
    /* eslint-enable lvi/no-raw-dom */
    const indices = asUint32(meshData.indices);
    geometry.setIndex(new BufferAttribute(indices, 1));
    addGeometryGroups(geometry, meshData, indices.length);
    if (smoothShading) geometry = applySmoothShading(geometry);
    geometry.computeBoundingBox();
    return geometry;
}
