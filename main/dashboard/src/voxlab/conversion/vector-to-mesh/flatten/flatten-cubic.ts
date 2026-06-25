import type { Point2D } from "../../raster-to-mesh/types/types-geom.js";
import { DEFAULT_MAX_SUBDIVISION_DEPTH } from "../constants/defaults.js";
import type { CubicBezier } from "./cubic-types.js";
import { isCubicFlat } from "./cubic-flatness.js";
import { splitCubic } from "./cubic-split.js";

export type { CubicBezier } from "./cubic-types.js";

function cubicSubdivide(b: CubicBezier, tol: number, depth: number, out: Point2D[]): void {
    if (depth <= 0 || isCubicFlat(b, tol)) {
        out.push({ x: b.p3.x, y: b.p3.y });
        return;
    }
    const [left, right] = splitCubic(b);
    cubicSubdivide(left, tol, depth - 1, out);
    cubicSubdivide(right, tol, depth - 1, out);
}

export function flattenCubic(bez: CubicBezier, tolerance: number, out: Point2D[]): void {
    cubicSubdivide(bez, tolerance, DEFAULT_MAX_SUBDIVISION_DEPTH, out);
}
