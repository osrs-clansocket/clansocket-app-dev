import type {
    FlowCardPlacement,
    FlowMeta,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";

export function compactPlacements(placements: readonly FlowCardPlacement[]): readonly FlowCardPlacement[] {
    if (placements.length === 0) return placements;
    const sortedRows = [...new Set(placements.map((p) => p.row))].sort((a, b) => a - b);
    const sortedCols = [...new Set(placements.map((p) => p.col))].sort((a, b) => a - b);
    const rowMap = new Map(sortedRows.map((r, i) => [r, i] as const));
    const colMap = new Map(sortedCols.map((c, i) => [c, i] as const));
    return placements.map((p) => ({ ...p, row: rowMap.get(p.row)!, col: colMap.get(p.col)! }));
}

export function compactFlow(flow: FlowMeta): FlowMeta {
    return { ...flow, placements: compactPlacements(flow.placements) };
}
