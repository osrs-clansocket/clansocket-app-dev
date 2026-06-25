import type { MeshData } from "../types/types-mesh.js";

export function assertExpectedSizes(mesh: MeshData, vertexCount: number, triangleCount: number): void {
    const expectedFloatLen = vertexCount * 3;
    const expectedIndexLen = triangleCount * 3;
    if (mesh.positions.length !== expectedFloatLen) {
        throw new Error(
            `@voxlab/raster-to-mesh: serializeBinary positions length ${mesh.positions.length} does not match vertexCount*3=${expectedFloatLen}`,
        );
    }
    if (mesh.indices.length !== expectedIndexLen) {
        throw new Error(
            `@voxlab/raster-to-mesh: serializeBinary indices length ${mesh.indices.length} does not match triangleCount*3=${expectedIndexLen}`,
        );
    }
    if (mesh.normals.length !== expectedFloatLen) {
        throw new Error(
            `@voxlab/raster-to-mesh: serializeBinary normals length ${mesh.normals.length} does not match vertexCount*3=${expectedFloatLen}`,
        );
    }
    if (mesh.colors.length !== expectedFloatLen) {
        throw new Error(
            `@voxlab/raster-to-mesh: serializeBinary colors length ${mesh.colors.length} does not match vertexCount*3=${expectedFloatLen}`,
        );
    }
}
