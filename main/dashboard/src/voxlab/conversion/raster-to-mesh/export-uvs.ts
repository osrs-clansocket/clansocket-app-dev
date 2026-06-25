import type { MeshGroupBoundaries } from "./types/types-mesh.js";

const POSITION_STRIDE = 3;
const UV_STRIDE = 2;
const MIN_UV_DENOMINATOR = 1e-6;

function xy2DBounds(positions: Float32Array): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (let i = 0; i < positions.length; i += POSITION_STRIDE) {
        const x = positions[i];
        const y = positions[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
}

export function faceUvs(positions: Float32Array, indices: Uint32Array, boundaries: MeshGroupBoundaries): Float32Array {
    const vertexCount = positions.length / POSITION_STRIDE;
    const uvs = new Float32Array(vertexCount * UV_STRIDE);
    const { minX, minY, maxX, maxY } = xy2DBounds(positions);
    const w = Math.max(MIN_UV_DENOMINATOR, maxX - minX);
    const h = Math.max(MIN_UV_DENOMINATOR, maxY - minY);
    const isBackVertex = new Set<number>();
    for (let i = boundaries.frontIndexEnd; i < boundaries.backIndexEnd; i++) isBackVertex.add(indices[i]);
    for (let v = 0; v < vertexCount; v++) {
        const x = positions[v * POSITION_STRIDE];
        const y = positions[v * POSITION_STRIDE + 1];
        const u = (x - minX) / w;
        uvs[v * UV_STRIDE] = isBackVertex.has(v) ? 1 - u : u;
        uvs[v * UV_STRIDE + 1] = (y - minY) / h;
    }
    return uvs;
}
