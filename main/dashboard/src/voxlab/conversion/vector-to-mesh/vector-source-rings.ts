import type { Point2D } from "../raster-to-mesh/types/types-geom.js";
import { parseSvgDoc } from "./parse-svg-doc.js";
import { pathToRings } from "./path-to-rings.js";
import type { VectorSource } from "./types.js";

export function sourceToRings(source: VectorSource, tolerance: number): Point2D[][] {
    if (source.kind === "svg-path") return pathToRings(source.pathData, tolerance);
    const paths = parseSvgDoc(source.svgText);
    const out: Point2D[][] = [];
    for (const d of paths) for (const ring of pathToRings(d, tolerance)) out.push(ring);
    return out;
}
