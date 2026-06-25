import type { LayoutState } from "../../../shared/types/voxlab/layout-types.js";

export function findSwapSide(state: LayoutState, id: string): boolean {
    const fromLeft = state.left.findIndex((e) => e.id === id);
    if (fromLeft >= 0) {
        const [entry] = state.left.splice(fromLeft, 1);
        state.right.push(entry);
        return true;
    }
    const fromRight = state.right.findIndex((e) => e.id === id);
    if (fromRight >= 0) {
        const [entry] = state.right.splice(fromRight, 1);
        state.left.push(entry);
        return true;
    }
    return false;
}
