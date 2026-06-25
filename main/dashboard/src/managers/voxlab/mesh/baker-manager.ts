import { createApngAccumulator } from "../../../voxlab/baker/apng-baker.js";
import { walkFrames, type FrameWalkerDeps } from "../../../voxlab/baker/frame-walker.js";
import { createGifAccumulator } from "../../../voxlab/baker/gif-baker.js";
import { pngAccumulator } from "../../../voxlab/baker/png-baker.js";
import type { CaptureService } from "../services/capture-service.js";
import type { TimelineManager } from "../timeline/timeline-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";

export type AnimationBakeFormat = "apng" | "gif" | "png-sequence";
export type FrameBakeFormat = "png" | "webp";

export interface BakeAnimationOptions {
    format: AnimationBakeFormat;
    width: number;
    height: number;
    fps: number;
    durationMs: number;
    transparent: boolean;
    gifWorkerScript?: string;
}

export interface BakeFrameOptions {
    format: FrameBakeFormat;
    width: number;
    height: number;
    transparent: boolean;
}

export interface BakeResult {
    blob: Blob;
    suggestedExtension: string;
}

export interface BakerManagerDeps {
    timeline: TimelineManager;
    capture: CaptureService;
    viewport: ViewportManager;
}

export class BakerManager {
    constructor(private readonly deps: BakerManagerDeps) {}

    async bakeFrame(opts: BakeFrameOptions): Promise<BakeResult> {
        const blob = await this.deps.capture.captureFrame({
            width: opts.width,
            height: opts.height,
            format: opts.format,
            transparent: opts.transparent,
        });
        return { blob, suggestedExtension: opts.format };
    }

    private async bakeApng(
        deps: FrameWalkerDeps,
        opts: BakeAnimationOptions,
        frameDelayMs: number,
    ): Promise<BakeResult> {
        const acc = createApngAccumulator();
        await walkFrames(deps, opts, (_idx, pixels) => acc.push(pixels, frameDelayMs));
        return { blob: acc.finalize(opts.width, opts.height), suggestedExtension: "apng" };
    }

    private async bakeGif(
        deps: FrameWalkerDeps,
        opts: BakeAnimationOptions,
        frameDelayMs: number,
    ): Promise<BakeResult> {
        const acc = createGifAccumulator(opts.width, opts.height, opts.gifWorkerScript);
        await walkFrames(deps, opts, (_idx, pixels) => acc.push(pixels, frameDelayMs));
        return { blob: await acc.finalize(), suggestedExtension: "gif" };
    }

    private async bakePngSequence(deps: FrameWalkerDeps, opts: BakeAnimationOptions): Promise<BakeResult> {
        const seqAcc = pngAccumulator();
        await walkFrames(deps, opts, async (idx, pixels) => {
            await seqAcc.push(idx, pixels);
        });
        return { blob: await seqAcc.finalize(), suggestedExtension: "zip" };
    }

    async bakeAnimation(opts: BakeAnimationOptions): Promise<BakeResult> {
        if (!this.deps.timeline.hasTimeline()) throw new Error(`No timeline loaded (format=${opts.format})`);
        const deps: FrameWalkerDeps = {
            viewport: this.deps.viewport,
            capture: this.deps.capture,
            timeline: this.deps.timeline,
        };
        const frameDelayMs = 1000 / opts.fps;
        if (opts.format === "apng") return this.bakeApng(deps, opts, frameDelayMs);
        if (opts.format === "gif") return this.bakeGif(deps, opts, frameDelayMs);
        return this.bakePngSequence(deps, opts);
    }
}
