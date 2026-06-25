/// <reference lib="webworker" />
import { vectorToMesh } from "../../../voxlab/conversion/vector-to-mesh/index.js";
import type { MeshData, VectorOpts } from "../../../voxlab/conversion/vector-to-mesh/types.js";

export interface VectorJob {
    id: number;
    options: VectorOpts;
}

export interface VectorOk {
    id: number;
    ok: true;
    mesh: MeshData;
}

export interface VectorErr {
    id: number;
    ok: false;
    error: string;
}

export type VectorResult = VectorOk | VectorErr;

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

self.onmessage = (e: MessageEvent<VectorJob>): void => {
    const { id, options } = e.data;
    try {
        const mesh = vectorToMesh(options);
        const ok: VectorOk = { id, mesh, ok: true };
        (self as DedicatedWorkerGlobalScope).postMessage(ok, gatherTransfer(mesh));
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const fail: VectorErr = { id, ok: false, error: message };
        (self as DedicatedWorkerGlobalScope).postMessage(fail);
    }
};
