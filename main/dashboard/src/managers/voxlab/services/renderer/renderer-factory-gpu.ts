import { webgpuAvailable } from "../gpu-capability.js";
import type { AnyRenderer, RendererOpts } from "./renderer-factory-types.js";

export async function pickGpuRenderer(opts: RendererOpts): Promise<AnyRenderer | null> {
    if (!(await webgpuAvailable())) return null;
    try {
        const mod = await import("three/webgpu");
        const Cls = (
            mod as unknown as {
                WebGPURenderer: new (params: {
                    canvas: HTMLCanvasElement;
                    antialias: boolean;
                    alpha: boolean;
                }) => unknown;
            }
        ).WebGPURenderer;
        const raw = new Cls({
            canvas: opts.canvas,
            antialias: opts.antialias ?? true,
            alpha: opts.alpha ?? true,
        }) as unknown as { init?: () => Promise<void> };
        if (typeof raw.init === "function") await raw.init();
        return raw as unknown as AnyRenderer;
    } catch {
        return null;
    }
}
