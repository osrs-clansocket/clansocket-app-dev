import type { MeshData } from "../../shared/types/voxlab/mesh/mesh-types.js";

export function meshAsJson(meshData: MeshData): string {
    return JSON.stringify({
        positions: Array.from(meshData.positions),
        indices: Array.from(meshData.indices),
        normals: Array.from(meshData.normals),
        colors: Array.from(meshData.colors),
        ...(meshData.uvs !== undefined ? { uvs: Array.from(meshData.uvs) } : {}),
        metadata: meshData.metadata,
    });
}

export function meshFileName(imageFileName: string): string {
    const lastDot = imageFileName.lastIndexOf(".");
    const stem = lastDot > 0 ? imageFileName.slice(0, lastDot) : imageFileName;
    return `${stem}.json`;
}
