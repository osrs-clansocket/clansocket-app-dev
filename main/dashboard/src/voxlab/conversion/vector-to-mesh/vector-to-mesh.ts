import { buildPolygons } from "../raster-to-mesh/contour/contour.js";
import { triangulatePolygon } from "../raster-to-mesh/triangulate.js";
import { resolveOptions } from "./resolve-options.js";
import type { MeshData, VectorOpts } from "./types.js";
import { validateInput } from "./vector-validate.js";
import { sourceToRings } from "./vector-source-rings.js";
import { applyOptionalSmoothing } from "./vector-smoothing.js";
import { buildExtrudedMesh } from "./vector-extrude-build.js";

export function vectorToMesh(options: VectorOpts): MeshData {
    validateInput(options);
    const resolved = resolveOptions(options);
    const rings = sourceToRings(options.source, resolved.bezierTolerance);
    const smoothed = applyOptionalSmoothing(rings, resolved);
    const polygons = buildPolygons(smoothed);
    if (polygons.length === 0) {
        throw new Error(
            `vectorToMesh: empty polygon set ${JSON.stringify({ source: options.source.kind, smoothedRings: smoothed.length })}`,
        );
    }
    const front = triangulatePolygon(polygons);
    return buildExtrudedMesh(front, resolved);
}
