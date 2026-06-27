import { signal, type Signal } from "../../../../factory";
import type { FlowCardConfig, FlowCardPlacement, FlowMeta } from "./flow-card-types.js";

let SEQUENCE = 0;

function nextCardId(): string {
    SEQUENCE += 1;
    return `card-${SEQUENCE}`;
}

let FLOW_SEQUENCE = 0;
function nextFlowId(): string {
    FLOW_SEQUENCE += 1;
    return `flow-${FLOW_SEQUENCE}`;
}

function defaultCardConfig(): FlowCardConfig {
    return { id: nextCardId(), triggerType: "", conditions: [], waitValue: null, waitUnit: "minutes" };
}

function defaultFlowMeta(): FlowMeta {
    return {
        id: nextFlowId(),
        name: "Untitled flow",
        enabled: false,
        loop: false,
        scheduleAtMs: null,
        placements: [{ config: defaultCardConfig(), row: 0, col: 0 }],
    };
}

export const flowMetaSignal: Signal<FlowMeta> = signal<FlowMeta>(defaultFlowMeta());
export const flowsListSignal: Signal<readonly FlowMeta[]> = signal<readonly FlowMeta[]>([flowMetaSignal()]);

export function placementsCurrent(): readonly FlowCardPlacement[] {
    return flowMetaSignal().placements;
}

function setMeta(patch: Partial<FlowMeta>): void {
    flowMetaSignal.set({ ...flowMetaSignal(), ...patch });
}

function setPlacements(next: readonly FlowCardPlacement[]): void {
    setMeta({ placements: next });
}

function isOccupied(row: number, col: number): boolean {
    return placementsCurrent().some((p) => p.row === row && p.col === col);
}

function placementById(id: string): FlowCardPlacement | null {
    return placementsCurrent().find((p) => p.config.id === id) ?? null;
}

export function addRight(fromId: string): void {
    const from = placementById(fromId);
    if (!from) return;
    let col = from.col + 1;
    while (isOccupied(from.row, col)) col += 1;
    setPlacements([...placementsCurrent(), { config: defaultCardConfig(), row: from.row, col }]);
}

export function addBelow(fromId: string): void {
    const from = placementById(fromId);
    if (!from) return;
    let row = from.row + 1;
    while (isOccupied(row, from.col)) row += 1;
    setPlacements([...placementsCurrent(), { config: defaultCardConfig(), row, col: from.col }]);
}

export function removeCard(id: string): void {
    setPlacements(placementsCurrent().filter((p) => p.config.id !== id));
}

export function updateCard(id: string, patch: Partial<FlowCardConfig>): void {
    setPlacements(
        placementsCurrent().map((p) => (p.config.id === id ? { ...p, config: { ...p.config, ...patch } } : p)),
    );
}

export function setFlowName(name: string): void {
    setMeta({ name });
}

export function setFlowEnabled(enabled: boolean): void {
    setMeta({ enabled });
}

export function setFlowLoop(loop: boolean): void {
    setMeta({ loop });
}

export function setFlowScheduleAtMs(scheduleAtMs: number | null): void {
    setMeta({ scheduleAtMs });
}

export function selectFlow(id: string): void {
    const found = flowsListSignal().find((f) => f.id === id);
    if (found) flowMetaSignal.set(found);
}

export function newFlow(): void {
    const fresh = defaultFlowMeta();
    flowsListSignal.set([...flowsListSignal(), fresh]);
    flowMetaSignal.set(fresh);
}

export function persistCurrentToList(): void {
    const current = flowMetaSignal();
    flowsListSignal.set(flowsListSignal().map((f) => (f.id === current.id ? current : f)));
}
