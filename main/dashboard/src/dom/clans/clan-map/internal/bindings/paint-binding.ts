import { effect, type Disposable } from "../../../../factory/reactive/index.js";
import { readPaintSignals, type PaintBindOpts, type SmearTracker } from "./paint-binding-frame.js";
import { makeSchedulePaint } from "./paint-binding-scheduler.js";

export type { PaintBindOpts } from "./paint-binding-frame.js";

const NOOP_DISPOSABLE: Disposable = { dispose: () => undefined };

export function bindPaint(opts: PaintBindOpts): Disposable {
    const bgCtx = opts.refs.bg.getContext("2d");
    const overlayCtx = opts.refs.overlay.getContext("2d");
    if (bgCtx === null || overlayCtx === null) return NOOP_DISPOSABLE;
    const smearTracker: SmearTracker = { state: null, lastPaintTime: performance.now(), residualRafId: 0 };
    const blipAnimator = opts.blipAnimator;
    const schedulePaint = makeSchedulePaint({ opts, bgCtx, overlayCtx, smearTracker, blipAnimator });
    const eff = effect(() => {
        opts.positions$();
        opts.regions$();
        readPaintSignals(opts.state);
        schedulePaint();
    });
    return {
        dispose: () => {
            eff.dispose();
            if (smearTracker.residualRafId !== 0) window.cancelAnimationFrame(smearTracker.residualRafId);
        },
    };
}
