import type { PolygonFace } from "../triangulate.js";
import { writeSideNormals } from "./extrude-write-normal.js";

export type { RingTopology } from "./extrude-ring-topology.js";

export function computeSideNormals(front: PolygonFace, sideNormals: Float32Array, frontVertCount: number): void {
    for (let p = 0; p < front.polygonStarts.length; p++) {
        writeSideNormals(
            front,
            { start: front.polygonStarts[p], end: front.polygonEnds[p] },
            sideNormals,
            frontVertCount,
        );
    }
}
