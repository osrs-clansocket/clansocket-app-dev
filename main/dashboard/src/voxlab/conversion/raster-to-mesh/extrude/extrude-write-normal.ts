import type { PolygonFace } from "../triangulate.js";
import { outwardAtVertex } from "./extrude-edge.js";
import { determineRingSign, type RingTopology } from "./extrude-ring-topology.js";

const STRIDE_3D = 3;
const MIN_RING_VERTS = 3;

interface SideNormalArgs {
    front: PolygonFace;
    ring: RingTopology;
    ringSize: number;
    i: number;
    sign: number;
    sideNormals: Float32Array;
    frontVertCount: number;
}

function writeNormalAt(a: SideNormalArgs): void {
    const { front, ring, ringSize, i, sign, sideNormals, frontVertCount } = a;
    const vIdx = ring.start + i;
    const prevIdx = ring.start + ((i - 1 + ringSize) % ringSize);
    const nextIdx = ring.start + ((i + 1) % ringSize);
    const { x: outwardX, y: outwardY } = outwardAtVertex({
        positions: front.positions,
        vIdx,
        prevIdx,
        nextIdx,
        sign,
    });
    const sideFrontIdx = vIdx * STRIDE_3D;
    const sideBackIdx = (frontVertCount + vIdx) * STRIDE_3D;
    sideNormals[sideFrontIdx] = outwardX;
    sideNormals[sideFrontIdx + 1] = outwardY;
    sideNormals[sideFrontIdx + 2] = 0;
    sideNormals[sideBackIdx] = outwardX;
    sideNormals[sideBackIdx + 1] = outwardY;
    sideNormals[sideBackIdx + 2] = 0;
}

export function writeSideNormals(
    front: PolygonFace,
    ring: RingTopology,
    sideNormals: Float32Array,
    frontVertCount: number,
): void {
    const ringSize = ring.end - ring.start;
    if (ringSize < MIN_RING_VERTS) return;
    const sign = determineRingSign(front.positions, ring);
    for (let i = 0; i < ringSize; i++) {
        writeNormalAt({ front, ring, ringSize, i, sign, sideNormals, frontVertCount });
    }
}
