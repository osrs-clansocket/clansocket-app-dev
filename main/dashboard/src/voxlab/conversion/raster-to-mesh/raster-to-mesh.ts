import { buildPolygons, chainSegments, chaikinSmooth, flattenBetweenCorners, taubinSmooth } from "./contour/contour.js";
import { buildMeshData } from "./export.js";
import { extrudeMesh } from "./extrude/extrude.js";
import { marchingSquares } from "./marching-squares.js";
import type { Polygon } from "./types/types-geom.js";
import { sampleImage } from "./sample.js";
import { triangulatePolygon } from "./triangulate.js";
import { voxelize } from "./voxelize/voxelize.js";
import { resolveOptions, validateInput, type Resolved } from "./raster-mesh-options.js";
import type { MeshData } from "./types/types-mesh.js";
import type { RasterOpts } from "./types/types-raster.js";
import { meshScale2D } from "./mesh-bounds.js";

export function rasterToMesh(options: RasterOpts): MeshData {
    validateInput(options);
    const resolved = resolveOptions(options);
    const sample = sampleImage(options.imageData);
    const voxel = voxelize(sample, resolved.voxelResolution, resolved.alphaThreshold);
    const segments = marchingSquares(voxel, resolved.alphaThreshold);
    const rings = chainSegments(segments);
    const chaikin = rings.map((ring) => chaikinSmooth(ring, resolved.smoothingPasses));
    const flattened = chaikin.map((ring) => flattenBetweenCorners(ring, resolved.cornerAngleDegrees));
    const smoothed = flattened.map((ring) =>
        taubinSmooth(ring, resolved.taubinRounds, resolved.taubinLambda, resolved.taubinMu),
    );
    const polygons = buildPolygons(smoothed);
    const front = triangulatePolygon(polygons);
    return buildExtrudedMesh(front, polygons, resolved, voxel);
}

function buildExtrudedMesh(
    front: ReturnType<typeof triangulatePolygon>,
    polygons: Polygon[],
    resolved: Resolved,
    voxel: import("./voxelize/voxelize.js").VoxelGrid,
): MeshData {
    const scale2D = meshScale2D(front.positions);
    const scaledDepth = resolved.extrusionDepth * scale2D;
    const extruded = extrudeMesh(front, scaledDepth, resolved.backFace);
    void polygons;
    return buildMeshData(extruded, {
        color: resolved.vertexColor,
        voxelResolution: resolved.voxelResolution,
        extrusionDepth: resolved.extrusionDepth,
        normalize: resolved.normalize,
        voxel,
    });
}
