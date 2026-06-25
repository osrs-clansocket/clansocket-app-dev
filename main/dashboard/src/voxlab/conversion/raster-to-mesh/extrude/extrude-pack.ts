import type { PolygonFace } from "../triangulate.js";
import { buildBackIndices } from "./extrude-buffers.js";

const STRIDE_3D = 3;
const SIDE_BUFFER_STRIDE = 6;

export interface PackExtrudedArgs {
    front: PolygonFace;
    frontVertCount: number;
    positionsFront: Float32Array;
    positionsBack: Float32Array;
    sidePositions: Float32Array;
    frontNormals: Float32Array;
    backNormals: Float32Array;
    sideNormals: Float32Array;
    sideIndices: Uint32Array;
}

export function packExtrudedBuffers(a: PackExtrudedArgs): {
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    frontIndices: number[] | Uint32Array;
    backIndices: Uint32Array;
} {
    const { front, frontVertCount, sideIndices } = a;
    const positions = new Float32Array(frontVertCount * 12);
    positions.set(a.positionsFront, 0);
    positions.set(a.positionsBack, frontVertCount * STRIDE_3D);
    positions.set(a.sidePositions, frontVertCount * SIDE_BUFFER_STRIDE);
    const normals = new Float32Array(positions.length);
    normals.set(a.frontNormals, 0);
    normals.set(a.backNormals, frontVertCount * STRIDE_3D);
    normals.set(a.sideNormals, frontVertCount * SIDE_BUFFER_STRIDE);
    const frontIndices = front.indices.slice();
    const backIndices = buildBackIndices(front.indices, frontVertCount);
    const indices = new Uint32Array(frontIndices.length + backIndices.length + sideIndices.length);
    indices.set(frontIndices, 0);
    indices.set(backIndices, frontIndices.length);
    indices.set(sideIndices, frontIndices.length + backIndices.length);
    return { positions, normals, indices, frontIndices, backIndices };
}
