import VectorToMeshWorker from "../workers/vector-to-mesh.worker.ts?worker";
import type { MeshData, VectorOpts } from "../../../voxlab/conversion/vector-to-mesh/types.js";
import type { VectorJob, VectorResult } from "../workers/vector-to-mesh.worker.js";
import { jobRunner } from "./worker-job-runner.js";

const VECTOR_JOB_TIMEOUT_MS = 120_000;

const runner = jobRunner<VectorJob, VectorResult>({
    createWorker: () => new VectorToMeshWorker(),
    timeoutMs: VECTOR_JOB_TIMEOUT_MS,
    label: "vector mesh",
});

export async function vectorMeshAsync(options: VectorOpts, signal?: AbortSignal): Promise<MeshData> {
    const result = await runner.post((id) => ({ id, options }), [], signal);
    if (!result.ok) throw new Error(`vector mesh job failed: ${result.error} (sourceKind=${options.source.kind})`);
    return result.mesh;
}

export function disposeVectorWorker(): void {
    runner.dispose();
}
