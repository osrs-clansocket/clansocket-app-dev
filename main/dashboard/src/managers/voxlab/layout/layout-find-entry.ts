import type { LayoutEntry, LayoutState } from "../../../shared/types/voxlab/layout-types.js";

export function findEntry(state: LayoutState, id: string): LayoutEntry | undefined {
    return state.left.find((e) => e.id === id) ?? state.right.find((e) => e.id === id);
}
