import type { Signal } from "../../../../factory/reactive/index.js";
import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import { easeOutCubic, makeViewportInterp, sameViewport } from "./viewport-animator-math.js";
import type { ViewportAnimRefs } from "./animator-refs.js";
import { applyStepWrite } from "./animator-write.js";

interface StepFnArgs {
    viewport$: Signal<AtlasBox>;
    clamp: (vp: AtlasBox) => AtlasBox;
    from: AtlasBox;
    to: AtlasBox;
    durationMs: number;
    refs: ViewportAnimRefs;
}

export function buildStepFn(args: StepFnArgs): (now: number) => void {
    const { viewport$, clamp, from, to, durationMs, refs } = args;
    const interpBox = makeViewportInterp(clamp, from, to);
    const startTime = performance.now();
    return function step(now: number): void {
        if (refs.lastWrite !== null && !sameViewport(viewport$(), refs.lastWrite)) {
            refs.rafId = 0;
            refs.lastWrite = null;
            return;
        }
        const t = Math.min(1, (now - startTime) / durationMs);
        applyStepWrite({ refs, viewport$, t, step, interp: interpBox(easeOutCubic(t)) });
    };
}
