import type { BufferGeometry } from "three";
import type { MeshData } from "../../shared/types/voxlab/mesh/mesh-types.js";

export const MATERIAL_GROUP_FRONT_BACK = 0;
export const MATERIAL_GROUP_SIDES = 1;

export function addGeometryGroups(geometry: BufferGeometry, meshData: MeshData, indicesLength: number): void {
    geometry.clearGroups();
    const bounds = meshData.metadata.groupBoundaries;
    if (bounds) {
        const flatCount = bounds.backIndexEnd;
        const sideCount = bounds.sideIndexEnd - bounds.backIndexEnd;
        if (flatCount > 0) geometry.addGroup(0, flatCount, MATERIAL_GROUP_FRONT_BACK);
        if (sideCount > 0) geometry.addGroup(flatCount, sideCount, MATERIAL_GROUP_SIDES);
    } else if (indicesLength > 0) {
        geometry.addGroup(0, indicesLength, MATERIAL_GROUP_FRONT_BACK);
    }
}
