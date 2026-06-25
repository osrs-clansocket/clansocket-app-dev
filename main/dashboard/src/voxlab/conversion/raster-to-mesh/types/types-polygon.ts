import type { Point2D } from "./types-point.js";

export interface Polygon {
    outer: Point2D[];
    holes: Point2D[][];
}
