import RasterToMeshWorker from "../workers/raster-to-mesh.worker.ts?worker";
import type { MeshData } from "../../../voxlab/conversion/raster-to-mesh/types/types-mesh.js";
import type { ImageDataLike, RasterOpts } from "../../../voxlab/conversion/raster-to-mesh/types/types-raster.js";
import type { MeshJob, MeshResult } from "../workers/raster-to-mesh.worker.js";
import { jobRunner } from "./worker-job-runner.js";

const RASTER_JOB_TIMEOUT_MS = 120_000;

const runner = jobRunner<MeshJob, MeshResult>({
    createWorker: () => new RasterToMeshWorker(),
    timeoutMs: RASTER_JOB_TIMEOUT_MS,
    label: "raster mesh",
});

function copyImageData(src: ImageDataLike): ImageDataLike {
    const copy = new Uint8ClampedArray(new ArrayBuffer(src.data.byteLength));
    copy.set(src.data);
    return { data: copy, width: src.width, height: src.height };
}

export async function rasterMeshAsync(options: RasterOpts, signal?: AbortSignal): Promise<MeshData> {
    const imageData = copyImageData(options.imageData);
    const job: Omit<MeshJob, "id"> = { options: { ...options, imageData } };
    const result = await runner.post((id) => ({ id, ...job }), [imageData.data.buffer], signal);
    if (!result.ok)
        throw new Error(`raster mesh job failed: ${result.error} (size=${imageData.width}x${imageData.height})`);
    return result.mesh;
}

export function disposeRasterWorker(): void {
    runner.dispose();
}
