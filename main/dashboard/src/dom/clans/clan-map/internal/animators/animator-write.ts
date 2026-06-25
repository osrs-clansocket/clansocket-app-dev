import type { Signal } from "../../../../factory/reactive/index.js";
import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import type { ViewportAnimRefs } from "./animator-refs.js";

interface StepWriteArgs {
    refs: ViewportAnimRefs;
    viewport$: Signal<AtlasBox>;
    interp: AtlasBox;
    t: number;
    step: (now: number) => void;
}

export function applyStepWrite(args: StepWriteArgs): void {
    const { refs, viewport$, interp, t, step } = args;
    viewport$.set(interp);
    refs.lastWrite = interp;
    if (t < 1) refs.rafId = window.requestAnimationFrame(step);
    else {
        refs.rafId = 0;
        refs.lastWrite = null;
    }
}
