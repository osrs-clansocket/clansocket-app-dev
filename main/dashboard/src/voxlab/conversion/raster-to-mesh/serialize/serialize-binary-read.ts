import type { MeshData } from "../types/types-mesh.js";
import {
    BINARY_HEADER_BYTES,
    COLOR_STRIDE,
    INDEX_STRIDE,
    NORMAL_STRIDE,
    POSITION_STRIDE,
    readBinaryHeader,
    validateBinaryHeader,
    type BinaryHeader,
} from "./serialize-binary-header.js";
import { alignBuffer } from "./serialize-buffer-utils.js";

function validateBinaryLength(
    bytes: Uint8Array,
    header: BinaryHeader,
    sizes: { positionsBytes: number; indicesBytes: number; normalsBytes: number; colorsBytes: number },
): void {
    const expectedTotal =
        BINARY_HEADER_BYTES + sizes.positionsBytes + sizes.indicesBytes + sizes.normalsBytes + sizes.colorsBytes;
    if (bytes.length !== expectedTotal) {
        throw new Error(
            `@voxlab/raster-to-mesh: parseBinary input length ${bytes.length} does not match expected ${expectedTotal} for vertexCount=${header.vertexCount}, triangleCount=${header.triangleCount}`,
        );
    }
}

function readBinaryBuffers(args: { aligned: ArrayBuffer; bytes: Uint8Array; header: BinaryHeader }): {
    positions: Float32Array;
    indices: Uint32Array;
    normals: Float32Array;
    colors: Float32Array;
} {
    const { aligned, bytes, header } = args;
    const sizes = {
        positionsBytes: header.vertexCount * POSITION_STRIDE,
        indicesBytes: header.triangleCount * INDEX_STRIDE,
        normalsBytes: header.vertexCount * NORMAL_STRIDE,
        colorsBytes: header.vertexCount * COLOR_STRIDE,
    };
    validateBinaryLength(bytes, header, sizes);
    let offset = BINARY_HEADER_BYTES;
    const positions = new Float32Array(aligned, offset, header.vertexCount * 3);
    offset += sizes.positionsBytes;
    const indices = new Uint32Array(aligned, offset, header.triangleCount * 3);
    offset += sizes.indicesBytes;
    const normals = new Float32Array(aligned, offset, header.vertexCount * 3);
    offset += sizes.normalsBytes;
    const colors = new Float32Array(aligned, offset, header.vertexCount * 3);
    return { positions, indices, normals, colors };
}

export function parseBinary(input: ArrayBuffer | Uint8Array): MeshData {
    const aligned = alignBuffer(input);
    const bytes = new Uint8Array(aligned);
    const view = new DataView(aligned);
    validateBinaryHeader(bytes, view);
    const header = readBinaryHeader(view);
    const { positions, indices, normals, colors } = readBinaryBuffers({ aligned, bytes, header });
    return {
        positions,
        indices,
        normals,
        colors,
        metadata: {
            vertexCount: header.vertexCount,
            triangleCount: header.triangleCount,
            bounds: header.bounds,
            voxelResolution: header.voxelResolution,
            extrusionDepth: header.extrusionDepth,
        },
    };
}
