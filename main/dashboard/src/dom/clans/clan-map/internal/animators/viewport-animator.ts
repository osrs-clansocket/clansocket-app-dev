import type { Signal } from "../../../../factory/reactive/index.js";
import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import type { ViewportAnimRefs } from "./animator-refs.js";
import { buildStepFn } from "./animator-step.js";

const DEFAULT_DURATION_MS = 200;

export interface ViewportAnimator {
    start(to: AtlasBox, durationMs?: number): void;
    cancel(): void;
}

export function makeViewportAnimator(viewport$: Signal<AtlasBox>, clamp: (vp: AtlasBox) => AtlasBox): ViewportAnimator {
    const refs: ViewportAnimRefs = { rafId: 0, lastWrite: null };
    const cancel = (): void => {
        if (refs.rafId !== 0) {
            window.cancelAnimationFrame(refs.rafId);
            refs.rafId = 0;
        }
        refs.lastWrite = null;
    };
    const start = (to: AtlasBox, durationMs: number = DEFAULT_DURATION_MS): void => {
        cancel();
        const step = buildStepFn({ viewport$, clamp, to, refs, durationMs, from: viewport$() });
        refs.rafId = window.requestAnimationFrame(step);
    };
    return { start, cancel };
}
