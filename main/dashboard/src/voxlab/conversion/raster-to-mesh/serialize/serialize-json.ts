import type { MeshData } from "../types/types-mesh.js";

export function serializeJson(mesh: MeshData): string {
    return JSON.stringify({
        positions: Array.from(mesh.positions),
        indices: Array.from(mesh.indices),
        normals: Array.from(mesh.normals),
        colors: Array.from(mesh.colors),
        metadata: mesh.metadata,
    });
}

export function parseJson(text: string): MeshData {
    const raw = JSON.parse(text);
    return {
        positions: new Float32Array(raw.positions),
        indices: new Uint32Array(raw.indices),
        normals: new Float32Array(raw.normals),
        colors: new Float32Array(raw.colors),
        metadata: raw.metadata,
    };
}
