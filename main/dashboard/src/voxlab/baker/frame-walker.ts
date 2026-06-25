import type { WalkOptions } from "./walk-options.js";
import type { FrameWalkerDeps } from "./frame-walker-deps.js";
import type { FrameConsumer } from "./frame-consumer.js";
import { waitForRaf, yieldMicrotask } from "./frame-walker-yields.js";

export type { WalkOptions } from "./walk-options.js";
export type { FrameWalkerDeps } from "./frame-walker-deps.js";
export type { FrameConsumer } from "./frame-consumer.js";

export async function walkFrames(deps: FrameWalkerDeps, opts: WalkOptions, onFrame: FrameConsumer): Promise<number> {
    const totalFrames = Math.max(1, Math.round((opts.durationMs / 1000) * opts.fps));
    deps.viewport.pauseTick();
    try {
        await waitForRaf();
        for (let n = 0; n < totalFrames; n++) {
            const timeMs = (n / opts.fps) * 1000;
            deps.timeline.seek(timeMs);
            if (n > 0) await yieldMicrotask();
            const pixels = deps.capture.capturePixels(opts.width, opts.height, opts.transparent, timeMs);
            await onFrame(n, pixels, timeMs);
        }
    } finally {
        deps.viewport.resumeTick();
    }
    return totalFrames;
}
