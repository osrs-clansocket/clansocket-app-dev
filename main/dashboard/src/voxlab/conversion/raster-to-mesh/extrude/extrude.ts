import type { PolygonFace } from "../triangulate.js";
import { buildConstantNormals, buildPlanePositions, buildSideBuffers } from "./extrude-buffers.js";
import { packExtrudedBuffers } from "./extrude-pack.js";

export interface ExtrudedMesh {
    positions: Float32Array;
    indices: Uint32Array;
    normals: Float32Array;
    groupBoundaries: {
        frontIndexEnd: number;
        backIndexEnd: number;
        sideIndexEnd: number;
    };
}

function extrudeFrontMesh(front: PolygonFace, halfDepth: number, frontVertCount: number): ExtrudedMesh {
    return {
        positions: buildPlanePositions(front.positions, halfDepth),
        indices: front.indices.slice(),
        normals: buildConstantNormals(frontVertCount, 0, 0, 1),
        groupBoundaries: {
            frontIndexEnd: front.indices.length,
            backIndexEnd: front.indices.length,
            sideIndexEnd: front.indices.length,
        },
    };
}

function makeExtrudeGroups(
    frontIndices: number[] | Uint32Array,
    backIndices: Uint32Array,
    sideIndices: Uint32Array,
): { frontIndexEnd: number; backIndexEnd: number; sideIndexEnd: number } {
    return {
        frontIndexEnd: frontIndices.length,
        backIndexEnd: frontIndices.length + backIndices.length,
        sideIndexEnd: frontIndices.length + backIndices.length + sideIndices.length,
    };
}

interface ExtrudeBuffers {
    positionsFront: Float32Array;
    positionsBack: Float32Array;
    frontNormals: Float32Array;
    backNormals: Float32Array;
    sidePositions: Float32Array;
    sideNormals: Float32Array;
    sideIndices: Uint32Array;
}

function buildExtrudeBuffers(args: { front: PolygonFace; halfDepth: number; frontVertCount: number }): ExtrudeBuffers {
    const { front, halfDepth, frontVertCount } = args;
    const { sidePositions, sideNormals, sideIndices } = buildSideBuffers(front, halfDepth, frontVertCount);
    return {
        positionsFront: buildPlanePositions(front.positions, halfDepth),
        positionsBack: buildPlanePositions(front.positions, -halfDepth),
        frontNormals: buildConstantNormals(frontVertCount, 0, 0, 1),
        backNormals: buildConstantNormals(frontVertCount, 0, 0, -1),
        sidePositions,
        sideNormals,
        sideIndices,
    };
}

export function extrudeMesh(front: PolygonFace, depth: number, backFace: boolean): ExtrudedMesh {
    const halfDepth = depth / 2;
    const frontVertCount = front.positions.length / 2;
    if (!backFace || depth <= 0) return extrudeFrontMesh(front, halfDepth, frontVertCount);
    const bufs = buildExtrudeBuffers({ front, halfDepth, frontVertCount });
    const { positions, normals, indices, frontIndices, backIndices } = packExtrudedBuffers({
        front,
        frontVertCount,
        ...bufs,
    });
    return {
        positions,
        indices,
        normals,
        groupBoundaries: makeExtrudeGroups(frontIndices, backIndices, bufs.sideIndices),
    };
}
