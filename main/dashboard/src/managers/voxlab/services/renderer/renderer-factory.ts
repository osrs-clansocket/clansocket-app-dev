import { WebGLRenderer } from "three";
import type { AnyRenderer, RendererOpts } from "./renderer-factory-types.js";
import { pickGpuRenderer } from "./renderer-factory-gpu.js";

export type { AnyRenderer, RendererOpts } from "./renderer-factory-types.js";

export async function pickRenderer(opts: RendererOpts): Promise<AnyRenderer> {
    if (opts.preferWebGpu !== false) {
        const gpu = await pickGpuRenderer(opts);
        if (gpu !== null) return gpu;
    }
    return new WebGLRenderer({
        canvas: opts.canvas,
        antialias: opts.antialias ?? true,
        alpha: opts.alpha ?? true,
    });
}
