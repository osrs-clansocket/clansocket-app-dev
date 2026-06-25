import type { Point2D } from "../raster-to-mesh/types/types-geom.js";

export interface ParseState {
    rings: Point2D[][];
    current: Point2D[];
    startPoint: Point2D | null;
    pen: Point2D;
    tolerance: number;
}
