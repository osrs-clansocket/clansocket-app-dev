import type { FlowCardPlacement } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";

export function placementAt(
    placements: readonly FlowCardPlacement[],
    row: number,
    col: number,
): FlowCardPlacement | null {
    return placements.find((p) => p.row === row && p.col === col) ?? null;
}
