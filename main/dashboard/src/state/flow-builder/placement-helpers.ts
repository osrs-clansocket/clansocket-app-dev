import type { FlowCardPlacement, FlowEdge, FlowMeta } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { compactPlacements } from "./placement-compactor.js";
import { flowMetaSignal } from "./flow-store.js";

export function placementsCurrent(): readonly FlowCardPlacement[] {
    return flowMetaSignal().placements;
}

export function edgesCurrent(): readonly FlowEdge[] {
    return flowMetaSignal().edges;
}

export function setMeta(patch: Partial<FlowMeta>): void {
    flowMetaSignal.set({ ...flowMetaSignal(), ...patch });
}

export function setPlacements(next: readonly FlowCardPlacement[]): void {
    setMeta({ placements: compactPlacements(next) });
}

export function setEdges(next: readonly FlowEdge[]): void {
    setMeta({ edges: next });
}

export function setPlacementsAndEdges(placements: readonly FlowCardPlacement[], edges: readonly FlowEdge[]): void {
    flowMetaSignal.set({ ...flowMetaSignal(), placements: compactPlacements(placements), edges });
}

export function isOccupied(row: number, col: number): boolean {
    return placementsCurrent().some((p) => p.row === row && p.col === col);
}

export function placementById(id: string): FlowCardPlacement | null {
    return placementsCurrent().find((p) => p.config.id === id) ?? null;
}
