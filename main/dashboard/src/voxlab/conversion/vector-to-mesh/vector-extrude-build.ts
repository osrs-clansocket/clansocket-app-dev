import { buildMeshData } from "../raster-to-mesh/export.js";
import { extrudeMesh } from "../raster-to-mesh/extrude/extrude.js";
import { triangulatePolygon } from "../raster-to-mesh/triangulate.js";
import { VECTOR_VOXEL_RESOLUTION_TELEMETRY } from "./constants/defaults.js";
import type { ResolvedOptions } from "./resolve-options.js";
import type { MeshData } from "./types.js";

function compute2DScale(positions2D: Float32Array): number {
    if (positions2D.length === 0) return 1;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < positions2D.length; i += 2) {
        const x = positions2D[i];
        const y = positions2D[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    return Math.max(maxX - minX, maxY - minY, 1);
}

export function buildExtrudedMesh(front: ReturnType<typeof triangulatePolygon>, r: ResolvedOptions): MeshData {
    const scale2D = compute2DScale(front.positions);
    const scaledDepth = r.extrusionDepth * scale2D;
    const extruded = extrudeMesh(front, scaledDepth, r.backFace);
    return buildMeshData(extruded, {
        color: r.vertexColor,
        voxelResolution: VECTOR_VOXEL_RESOLUTION_TELEMETRY,
        extrusionDepth: r.extrusionDepth,
        normalize: r.normalize,
    });
}
