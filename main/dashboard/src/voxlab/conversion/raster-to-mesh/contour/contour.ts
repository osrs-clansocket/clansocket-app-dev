import type { Point2D, Polygon } from "../types/types-geom.js";
import { computeRingDepths } from "../ring/ring-depths.js";
import { normalizeRingDirection } from "../ring/ring-direction.js";
import { pointInRing } from "../ring/ring-point-in.js";

export { chainSegments } from "./contour-chain.js";
export { chaikinSmooth, flattenBetweenCorners, taubinSmooth } from "./contour-smooth.js";

export function buildPolygons(rings: Point2D[][]): Polygon[] {
    if (rings.length === 0) return [];
    const depths = computeRingDepths(rings);
    const outers: { ring: Point2D[]; depth: number }[] = [];
    const holes: { ring: Point2D[]; depth: number }[] = [];
    for (let i = 0; i < rings.length; i++) {
        const entry = { ring: rings[i], depth: depths[i] };
        if (depths[i] % 2 === 0) outers.push(entry);
        else holes.push(entry);
    }
    return outers.map((outer) => ({
        outer: normalizeRingDirection(outer.ring, true),
        holes: holes
            .filter((h) => h.depth === outer.depth + 1 && pointInRing(h.ring[0], outer.ring))
            .map((h) => normalizeRingDirection(h.ring, false)),
    }));
}
