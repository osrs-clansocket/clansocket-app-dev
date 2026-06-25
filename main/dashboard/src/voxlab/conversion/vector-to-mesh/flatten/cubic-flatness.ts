import type { Point2D } from "../../raster-to-mesh/types/types-geom.js";
import type { CubicBezier } from "./cubic-types.js";

function cubicPerpDist(p: Point2D, anchor: Point2D, ax: number, ay: number): number {
    const dx = p.x - anchor.x;
    const dy = p.y - anchor.y;
    const cross = Math.abs(dx * ay - dy * ax);
    const len = Math.sqrt(ax * ax + ay * ay);
    return len > 0 ? cross / len : Math.sqrt(dx * dx + dy * dy);
}

export function isCubicFlat(b: CubicBezier, tol: number): boolean {
    const ax = b.p3.x - b.p0.x;
    const ay = b.p3.y - b.p0.y;
    const d1 = cubicPerpDist(b.p1, b.p0, ax, ay);
    const d2 = cubicPerpDist(b.p2, b.p0, ax, ay);
    return Math.max(d1, d2) <= tol;
}
