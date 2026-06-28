import type {
    FlowCardPlacement,
    FlowMeta,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { compactPlacements } from "./placement-compactor.js";
import { flowMetaSignal } from "./flow-store.js";

export function placementsCurrent(): readonly FlowCardPlacement[] {
    return flowMetaSignal().placements;
}

export function setMeta(patch: Partial<FlowMeta>): void {
    flowMetaSignal.set({ ...flowMetaSignal(), ...patch });
}

export function setPlacements(next: readonly FlowCardPlacement[]): void {
    setMeta({ placements: compactPlacements(next) });
}

export function isOccupied(row: number, col: number): boolean {
    return placementsCurrent().some((p) => p.row === row && p.col === col);
}

export function placementById(id: string): FlowCardPlacement | null {
    return placementsCurrent().find((p) => p.config.id === id) ?? null;
}
