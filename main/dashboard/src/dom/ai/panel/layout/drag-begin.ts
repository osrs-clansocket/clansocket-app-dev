import { atBottom } from "./bar-height.js";
import { rafScheduler } from "../../../../managers/raf.js";
import { followScroll, noopScroll, type DragState, type DragTargets } from "./resize-drag-state.js";
import { applyDragTick } from "./drag-tick.js";

const EXPANDED_CLASS = "ai-bar--expanded";
const RESIZING_CLASS = "ai-bar--resizing";

export function beginDrag(state: DragState, targets: DragTargets, e: PointerEvent): void {
    const { bar, handle, history } = targets;
    if (!bar.classList.contains(EXPANDED_CLASS)) bar.classList.add(EXPANDED_CLASS);
    state.startY = e.clientY;
    state.pendingY = e.clientY;
    state.lastAppliedY = e.clientY;
    state.startH = history.getBoundingClientRect().height;
    state.startScrollHeight = history.scrollHeight;
    state.startDistFromBottom = history.scrollHeight - history.scrollTop - history.clientHeight;
    state.prevAppliedH = state.startH;
    state.applyScrollFollow = atBottom() ? followScroll : noopScroll;
    bar.classList.add(RESIZING_CLASS);
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
    state.unsub = rafScheduler.subscribe(() => applyDragTick(state, bar, history));
}
