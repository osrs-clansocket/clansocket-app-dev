import type { BufferGeometry } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MERGE_VERTICES_TOLERANCE } from "../../shared/constants/voxlab/material-constants.js";

export function applySmoothShading(geometry: BufferGeometry): BufferGeometry {
    try {
        const merged = mergeVertices(geometry, MERGE_VERTICES_TOLERANCE);
        merged.computeVertexNormals();
        return merged;
    } catch {
        return geometry;
    }
}
