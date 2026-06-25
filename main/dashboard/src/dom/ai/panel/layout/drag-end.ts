import { persistCurrentHeight } from "./resize-storage.js";
import type { DragState } from "./resize-drag-state.js";
import { releaseDragPointer } from "./drag-pointer.js";

const RESIZING_CLASS = "ai-bar--resizing";

export function endDrag(state: DragState, bar: HTMLElement, handle: HTMLElement, e: PointerEvent): void {
    state.unsub?.();
    state.unsub = null;
    bar.classList.remove(RESIZING_CLASS);
    releaseDragPointer(handle, e.pointerId);
    persistCurrentHeight(bar);
}
