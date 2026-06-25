import type { DragState } from "./resize-drag-state.js";

export { createDragState } from "./resize-drag-state.js";
export type { DragState, DragTargets } from "./resize-drag-state.js";
export { beginDrag } from "./drag-begin.js";
export { endDrag } from "./drag-end.js";

export function continueDrag(state: DragState, e: PointerEvent): void {
    state.pendingY = e.clientY;
}
