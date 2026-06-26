import { wirePointerDrag } from "../../../factory/index.js";
import { applyHeight, clampHeight, readStored } from "./resize-storage.js";
import { beginDrag, continueDrag, createDragState, endDrag, type DragTargets } from "./resize-drag.js";

function initResize(bar: HTMLElement, handle: HTMLElement, history: HTMLElement): void {
    const stored = readStored();
    if (stored !== undefined) applyHeight(bar, clampHeight(stored));
    const state = createDragState();
    const guarded =
        (action: (e: PointerEvent) => void) =>
        (e: PointerEvent): void => {
            if (state.unsub !== null) action(e);
        };
    const targets: DragTargets = { bar, handle, history };
    const onEnd = guarded((e) => endDrag(state, bar, handle, e));
    wirePointerDrag(handle, {
        down: (e) => beginDrag(state, targets, e),
        move: guarded((e) => continueDrag(state, e)),
        up: onEnd,
        cancel: onEnd,
    });
}

export { initResize };
