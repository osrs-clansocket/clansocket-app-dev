import type { ExtrudedMesh } from "./extrude/extrude.js";
import type { MeshBounds, MeshData } from "./types/types-mesh.js";
import type { VoxelGrid } from "./voxelize/voxelize.js";
import { voxelColors } from "./voxelize/voxel-colors.js";
import { faceUvs } from "./export-uvs.js";

const POSITION_STRIDE = 3;
const RGB_STRIDE = 3;

interface ExportOptions {
    color: readonly [number, number, number];
    voxelResolution: number;
    extrusionDepth: number;
    normalize: boolean;
    voxel?: VoxelGrid;
}

export function buildMeshData(mesh: ExtrudedMesh, options: ExportOptions): MeshData {
    const initialBounds = computeBounds(mesh.positions);
    const positions = options.normalize ? normalizePositions(mesh.positions, initialBounds) : mesh.positions.slice();
    const normals = options.normalize ? mirrorYNormals(mesh.normals) : mesh.normals.slice();
    const colors = options.voxel
        ? voxelColors(mesh.positions, options.voxel)
        : buildColors(positions.length / POSITION_STRIDE, options.color);
    const uvs = faceUvs(positions, mesh.indices, mesh.groupBoundaries);
    const finalBounds = options.normalize ? computeBounds(positions) : initialBounds;
    return {
        positions,
        normals,
        colors,
        uvs,
        indices: mesh.indices.slice(),
        metadata: {
            vertexCount: positions.length / POSITION_STRIDE,
            triangleCount: mesh.indices.length / 3,
            bounds: finalBounds,
            voxelResolution: options.voxelResolution,
            extrusionDepth: options.extrusionDepth,
            groupBoundaries: { ...mesh.groupBoundaries },
        },
    };
}

function normalizePositions(positions: Float32Array, bounds: MeshBounds): Float32Array {
    const cx = (bounds.min[0] + bounds.max[0]) / 2;
    const cy = (bounds.min[1] + bounds.max[1]) / 2;
    const cz = (bounds.min[2] + bounds.max[2]) / 2;
    const rangeX = bounds.max[0] - bounds.min[0];
    const rangeY = bounds.max[1] - bounds.min[1];
    const longest = Math.max(rangeX, rangeY);
    const scale = longest > 0 ? 1 / longest : 1;
    const out = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += POSITION_STRIDE) {
        out[i] = (positions[i] - cx) * scale;
        out[i + 1] = -(positions[i + 1] - cy) * scale;
        out[i + 2] = (positions[i + 2] - cz) * scale;
    }
    return out;
}

function mirrorYNormals(normals: Float32Array): Float32Array {
    const out = new Float32Array(normals.length);
    for (let i = 0; i < normals.length; i += POSITION_STRIDE) {
        out[i] = normals[i];
        out[i + 1] = -normals[i + 1];
        out[i + 2] = normals[i + 2];
    }
    return out;
}

function buildColors(vertexCount: number, color: readonly [number, number, number]): Float32Array {
    const out = new Float32Array(vertexCount * RGB_STRIDE);
    for (let i = 0; i < vertexCount; i++) {
        out[i * RGB_STRIDE] = color[0];
        out[i * RGB_STRIDE + 1] = color[1];
        out[i * RGB_STRIDE + 2] = color[2];
    }
    return out;
}

function computeBounds(positions: Float32Array): MeshBounds {
    if (positions.length === 0) return { min: [0, 0, 0], max: [0, 0, 0] };
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += POSITION_STRIDE) {
        for (let axis = 0; axis < POSITION_STRIDE; axis++) {
            const v = positions[i + axis];
            if (v < min[axis]) min[axis] = v;
            if (v > max[axis]) max[axis] = v;
        }
    }
    return { min, max };
}
