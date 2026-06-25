import type { DragState } from "./drag-state-types.js";
import { noopScroll } from "./drag-scroll.js";

export type { DragState, DragTargets } from "./drag-state-types.js";
export { followScroll, noopScroll } from "./drag-scroll.js";

export function createDragState(): DragState {
    const z = 0;
    return {
        startY: z,
        startH: z,
        startDistFromBottom: z,
        startScrollHeight: z,
        pendingY: z,
        lastAppliedY: z,
        prevAppliedH: z,
        applyScrollFollow: noopScroll,
        unsub: null,
    };
}
