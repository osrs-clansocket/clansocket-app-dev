import type { Point2D } from "../../raster-to-mesh/types/types-geom.js";

export function cubicMidpoint(a: Point2D, b: Point2D): Point2D {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
