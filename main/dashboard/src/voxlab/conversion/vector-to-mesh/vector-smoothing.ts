import { chaikinSmooth, flattenBetweenCorners, taubinSmooth } from "../raster-to-mesh/contour/contour.js";
import type { Point2D } from "../raster-to-mesh/types/types-geom.js";
import type { ResolvedOptions } from "./resolve-options.js";

export function applyOptionalSmoothing(rings: Point2D[][], r: ResolvedOptions): Point2D[][] {
    if (r.smoothingPasses === 0 && r.taubinRounds === 0 && r.cornerAngleDegrees === 0) return rings;
    let result = rings;
    if (r.smoothingPasses > 0) result = result.map((ring) => chaikinSmooth(ring, r.smoothingPasses));
    if (r.cornerAngleDegrees > 0) result = result.map((ring) => flattenBetweenCorners(ring, r.cornerAngleDegrees));
    if (r.taubinRounds > 0)
        result = result.map((ring) => taubinSmooth(ring, r.taubinRounds, r.taubinLambda, r.taubinMu));
    return result;
}
