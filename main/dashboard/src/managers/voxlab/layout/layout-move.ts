import type { LayoutEntry, LayoutState } from "../../../shared/types/voxlab/layout-types.js";

function moveWithin(list: LayoutEntry[], idx: number, delta: number): boolean {
    const target = idx + delta;
    if (target < 0 || target >= list.length) return false;
    const [moved] = list.splice(idx, 1);
    list.splice(target, 0, moved);
    return true;
}

export function move(state: LayoutState, id: string, delta: number): boolean {
    const leftIdx = state.left.findIndex((e) => e.id === id);
    if (leftIdx >= 0) return moveWithin(state.left, leftIdx, delta);
    const rightIdx = state.right.findIndex((e) => e.id === id);
    if (rightIdx >= 0) return moveWithin(state.right, rightIdx, delta);
    return false;
}
