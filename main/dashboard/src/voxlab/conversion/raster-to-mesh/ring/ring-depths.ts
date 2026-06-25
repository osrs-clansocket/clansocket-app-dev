import type { Point2D } from "../types/types-geom.js";
import { pointInRing } from "./ring-point-in.js";

export function computeRingDepths(rings: Point2D[][]): number[] {
    return rings.map((ring) => {
        const sample = ring[0];
        let depth = 0;
        for (let i = 0; i < rings.length; i++) {
            if (rings[i] === ring) continue;
            if (pointInRing(sample, rings[i])) depth++;
        }
        return depth;
    });
}
