import type { MeshData } from "../types/types-mesh.js";

const MAGIC_K = 0x4b;
const MAGIC_M = 0x4d;
const MAGIC_S = 0x53;
const MAGIC_H = 0x48;
export const MAGIC_BYTES = [MAGIC_K, MAGIC_M, MAGIC_S, MAGIC_H] as const;

export const BINARY_FORMAT_VERSION = 1;
export const BINARY_HEADER_BYTES = 48;
export const BINARY_MAGIC = "KMSH";

export const F32_BYTES = 4;
const U32_BYTES = 4;
export const POSITION_STRIDE = 3 * F32_BYTES;
export const INDEX_STRIDE = 3 * U32_BYTES;
export const NORMAL_STRIDE = 3 * F32_BYTES;
export const COLOR_STRIDE = 3 * F32_BYTES;

const HEADER_OFFSET_MAGIC = 0;
const HEADER_OFFSET_VERSION = 4;
const HEADER_OFFSET_VERTEX_COUNT = 8;
const HEADER_OFFSET_TRIANGLE_COUNT = 12;
const HEADER_OFFSET_BOUNDS_MIN = 16;
const HEADER_OFFSET_BOUNDS_MAX = 28;
const HEADER_OFFSET_VOXEL_RESOLUTION = 40;
const HEADER_OFFSET_EXTRUSION_DEPTH = 44;

export interface BinaryHeader {
    vertexCount: number;
    triangleCount: number;
    bounds: { min: readonly [number, number, number]; max: readonly [number, number, number] };
    voxelResolution: number;
    extrusionDepth: number;
}

interface WriteBinaryHeader {
    view: DataView;
    bytes: Uint8Array;
    mesh: MeshData;
    vertexCount: number;
    triangleCount: number;
}

export function writeBinaryHeader(args: WriteBinaryHeader): void {
    const { view, bytes, mesh, vertexCount, triangleCount } = args;
    for (let i = 0; i < MAGIC_BYTES.length; i++) bytes[HEADER_OFFSET_MAGIC + i] = MAGIC_BYTES[i];
    view.setUint32(HEADER_OFFSET_VERSION, BINARY_FORMAT_VERSION, true);
    view.setUint32(HEADER_OFFSET_VERTEX_COUNT, vertexCount, true);
    view.setUint32(HEADER_OFFSET_TRIANGLE_COUNT, triangleCount, true);
    view.setFloat32(HEADER_OFFSET_BOUNDS_MIN, mesh.metadata.bounds.min[0], true);
    view.setFloat32(HEADER_OFFSET_BOUNDS_MIN + F32_BYTES, mesh.metadata.bounds.min[1], true);
    view.setFloat32(HEADER_OFFSET_BOUNDS_MIN + F32_BYTES * 2, mesh.metadata.bounds.min[2], true);
    view.setFloat32(HEADER_OFFSET_BOUNDS_MAX, mesh.metadata.bounds.max[0], true);
    view.setFloat32(HEADER_OFFSET_BOUNDS_MAX + F32_BYTES, mesh.metadata.bounds.max[1], true);
    view.setFloat32(HEADER_OFFSET_BOUNDS_MAX + F32_BYTES * 2, mesh.metadata.bounds.max[2], true);
    view.setUint32(HEADER_OFFSET_VOXEL_RESOLUTION, mesh.metadata.voxelResolution, true);
    view.setFloat32(HEADER_OFFSET_EXTRUSION_DEPTH, mesh.metadata.extrusionDepth, true);
}

export function validateBinaryHeader(bytes: Uint8Array, view: DataView): void {
    if (bytes.length < BINARY_HEADER_BYTES) {
        throw new Error(
            `@voxlab/raster-to-mesh: parseBinary input is ${bytes.length} bytes — header alone is ${BINARY_HEADER_BYTES}`,
        );
    }
    for (let i = 0; i < MAGIC_BYTES.length; i++) {
        if (bytes[HEADER_OFFSET_MAGIC + i] !== MAGIC_BYTES[i]) {
            throw new Error(
                `@voxlab/raster-to-mesh: parseBinary input does not start with ${BINARY_MAGIC} magic bytes`,
            );
        }
    }
    const version = view.getUint32(HEADER_OFFSET_VERSION, true);
    if (version !== BINARY_FORMAT_VERSION) {
        throw new Error(
            `@voxlab/raster-to-mesh: parseBinary unsupported format version ${version} (this build expects ${BINARY_FORMAT_VERSION})`,
        );
    }
}

export function readBinaryHeader(view: DataView): BinaryHeader {
    return {
        vertexCount: view.getUint32(HEADER_OFFSET_VERTEX_COUNT, true),
        triangleCount: view.getUint32(HEADER_OFFSET_TRIANGLE_COUNT, true),
        bounds: {
            min: [
                view.getFloat32(HEADER_OFFSET_BOUNDS_MIN, true),
                view.getFloat32(HEADER_OFFSET_BOUNDS_MIN + F32_BYTES, true),
                view.getFloat32(HEADER_OFFSET_BOUNDS_MIN + F32_BYTES * 2, true),
            ] as const,
            max: [
                view.getFloat32(HEADER_OFFSET_BOUNDS_MAX, true),
                view.getFloat32(HEADER_OFFSET_BOUNDS_MAX + F32_BYTES, true),
                view.getFloat32(HEADER_OFFSET_BOUNDS_MAX + F32_BYTES * 2, true),
            ] as const,
        },
        voxelResolution: view.getUint32(HEADER_OFFSET_VOXEL_RESOLUTION, true),
        extrusionDepth: view.getFloat32(HEADER_OFFSET_EXTRUSION_DEPTH, true),
    };
}
