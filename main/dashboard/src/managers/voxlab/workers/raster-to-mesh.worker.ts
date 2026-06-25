/// <reference lib="webworker" />
import { rasterToMesh } from "../../../voxlab/conversion/raster-to-mesh/index.js";
import type { MeshData } from "../../../voxlab/conversion/raster-to-mesh/types/types-mesh.js";
import type { RasterOpts } from "../../../voxlab/conversion/raster-to-mesh/types/types-raster.js";

export interface MeshJob {
    id: number;
    options: RasterOpts;
}

export interface MeshOk {
    id: number;
    ok: true;
    mesh: MeshData;
}

export interface MeshErr {
    id: number;
    ok: false;
    error: string;
}

export type MeshResult = MeshOk | MeshErr;

function gatherTransfer(mesh: MeshData): ArrayBuffer[] {
    const transfer: ArrayBuffer[] = [
        mesh.positions.buffer as ArrayBuffer,
        mesh.indices.buffer as ArrayBuffer,
        mesh.normals.buffer as ArrayBuffer,
        mesh.colors.buffer as ArrayBuffer,
    ];
    if (mesh.uvs !== undefined) transfer.push(mesh.uvs.buffer as ArrayBuffer);
    return transfer;
}

self.onmessage = (e: MessageEvent<MeshJob>): void => {
    const { id, options } = e.data;
    try {
        const mesh = rasterToMesh(options);
        const ok: MeshOk = { id, mesh, ok: true };
        (self as DedicatedWorkerGlobalScope).postMessage(ok, gatherTransfer(mesh));
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const fail: MeshErr = { id, ok: false, error: message };
        (self as DedicatedWorkerGlobalScope).postMessage(fail);
    }
};
