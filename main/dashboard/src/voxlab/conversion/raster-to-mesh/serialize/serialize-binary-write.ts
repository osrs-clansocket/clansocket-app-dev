import type { MeshData } from "../types/types-mesh.js";
import {
    BINARY_HEADER_BYTES,
    COLOR_STRIDE,
    INDEX_STRIDE,
    NORMAL_STRIDE,
    POSITION_STRIDE,
    writeBinaryHeader,
} from "./serialize-binary-header.js";
import { asBytes } from "./serialize-buffer-utils.js";
import { assertExpectedSizes } from "./serialize-assert-sizes.js";

export function serializeBinary(mesh: MeshData): Uint8Array {
    const { vertexCount, triangleCount } = mesh.metadata;
    assertExpectedSizes(mesh, vertexCount, triangleCount);
    const positionsBytes = vertexCount * POSITION_STRIDE;
    const indicesBytes = triangleCount * INDEX_STRIDE;
    const normalsBytes = vertexCount * NORMAL_STRIDE;
    const colorsBytes = vertexCount * COLOR_STRIDE;
    const totalBytes = BINARY_HEADER_BYTES + positionsBytes + indicesBytes + normalsBytes + colorsBytes;
    const buffer = new ArrayBuffer(totalBytes);
    const bytes = new Uint8Array(buffer);
    writeBinaryHeader({ view: new DataView(buffer), bytes, mesh, vertexCount, triangleCount });
    let offset = BINARY_HEADER_BYTES;
    bytes.set(asBytes(mesh.positions), offset);
    offset += positionsBytes;
    bytes.set(asBytes(mesh.indices), offset);
    offset += indicesBytes;
    bytes.set(asBytes(mesh.normals), offset);
    offset += normalsBytes;
    bytes.set(asBytes(mesh.colors), offset);
    return bytes;
}
