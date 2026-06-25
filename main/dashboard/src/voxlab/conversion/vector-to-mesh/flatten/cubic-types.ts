import type { Point2D } from "../../raster-to-mesh/types/types-geom.js";

export interface CubicBezier {
    p0: Point2D;
    p1: Point2D;
    p2: Point2D;
    p3: Point2D;
}
