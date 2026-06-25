import { scheduleOp } from "../../../../factory/scheduler/index.js";
import type { BlipPositionAnimator } from "../../paint/animators/blip-position-animator.js";
import { paintFrame, type PaintBindOpts, type SmearTracker } from "./paint-binding-frame.js";

interface PaintSchedulerDeps {
    opts: PaintBindOpts;
    bgCtx: CanvasRenderingContext2D;
    overlayCtx: CanvasRenderingContext2D;
    smearTracker: SmearTracker;
    blipAnimator: BlipPositionAnimator;
}

export function makeSchedulePaint(d: PaintSchedulerDeps): () => void {
    let paintScheduled = false;
    const fn = (): void => {
        if (paintScheduled) return;
        paintScheduled = true;
        scheduleOp(() => {
            paintScheduled = false;
            paintFrame({
                ...d.opts,
                bgCtx: d.bgCtx,
                overlayCtx: d.overlayCtx,
                onTileReady: fn,
                smearTracker: d.smearTracker,
                blipAnimator: d.blipAnimator,
            });
        }, "animation");
    };
    return fn;
}
