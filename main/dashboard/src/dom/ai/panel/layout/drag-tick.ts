import { applyHeight, clampHeight } from "./resize-storage.js";
import type { DragState } from "./resize-drag-state.js";

export function applyDragTick(state: DragState, bar: HTMLElement, history: HTMLElement): void {
    if (state.pendingY === state.lastAppliedY) return;
    state.lastAppliedY = state.pendingY;
    const newH = clampHeight(state.startH + (state.startY - state.pendingY));
    applyHeight(bar, newH);
    const sh = state.startScrollHeight;
    const maxScroll = Math.max(0, sh - Math.min(sh, newH));
    history.scrollTop = Math.max(0, Math.min(maxScroll, maxScroll - state.startDistFromBottom));
    state.applyScrollFollow(newH - state.prevAppliedH);
    state.prevAppliedH = newH;
}
