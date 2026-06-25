import type { PolygonFace } from "../triangulate.js";
import { computeSideNormals } from "./extrude-normals.js";

const STRIDE_3D = 3;
const MIN_RING_VERTS = 3;

function buildSideIndices(front: PolygonFace, sideFrontBase: number, sideBackBase: number): Uint32Array {
    const sides: number[] = [];
    for (let p = 0; p < front.polygonStarts.length; p++) {
        const start = front.polygonStarts[p];
        const end = front.polygonEnds[p];
        const ringSize = end - start;
        if (ringSize < MIN_RING_VERTS) continue;
        for (let i = 0; i < ringSize; i++) {
            const localA = i;
            const localB = (i + 1) % ringSize;
            const a = sideFrontBase + start + localA;
            const b = sideFrontBase + start + localB;
            const aBack = sideBackBase + start + localA;
            const bBack = sideBackBase + start + localB;
            sides.push(a, b, bBack);
            sides.push(a, bBack, aBack);
        }
    }
    return Uint32Array.from(sides);
}

function fillSidePositions(front: PolygonFace, halfDepth: number, frontVertCount: number): Float32Array {
    const sidePositions = new Float32Array(frontVertCount * 2 * STRIDE_3D);
    for (let i = 0; i < frontVertCount; i++) {
        const x = front.positions[i * 2];
        const y = front.positions[i * 2 + 1];
        sidePositions[i * STRIDE_3D] = x;
        sidePositions[i * STRIDE_3D + 1] = y;
        sidePositions[i * STRIDE_3D + 2] = halfDepth;
        sidePositions[(frontVertCount + i) * STRIDE_3D] = x;
        sidePositions[(frontVertCount + i) * STRIDE_3D + 1] = y;
        sidePositions[(frontVertCount + i) * STRIDE_3D + 2] = -halfDepth;
    }
    return sidePositions;
}

export function buildSideBuffers(
    front: PolygonFace,
    halfDepth: number,
    frontVertCount: number,
): { sidePositions: Float32Array; sideNormals: Float32Array; sideIndices: Uint32Array } {
    const sidePositions = fillSidePositions(front, halfDepth, frontVertCount);
    const sideNormals = new Float32Array(frontVertCount * 2 * STRIDE_3D);
    computeSideNormals(front, sideNormals, frontVertCount);
    const sideFrontBase = frontVertCount * 2;
    const sideIndices = buildSideIndices(front, sideFrontBase, sideFrontBase + frontVertCount);
    return { sidePositions, sideNormals, sideIndices };
}
