import { signal, type Signal } from "../../../../factory";
import { readStored, writeStored } from "../../../../../state/persistence/index.js";
import type { FlowCardConfig, FlowCardPlacement, FlowMeta } from "./flow-card-types.js";

const STORAGE_KEY = "flow-builder.flows";

const CARD_ID_PATTERN = /^card-(\d+)$/;
const FLOW_ID_PATTERN = /^flow-(\d+)$/;

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

function maxIdSuffix(values: Iterable<string>, pattern: RegExp): number {
    let max = 0;
    for (const value of values) {
        const match = pattern.exec(value);
        if (!match) continue;
        const n = Number(match[1]);
        if (Number.isFinite(n) && n > max) max = n;
    }
    return max;
}

function seedSequences(flows: readonly FlowMeta[]): void {
    const flowIds: string[] = [];
    const cardIds: string[] = [];
    for (const flow of flows) {
        flowIds.push(flow.id);
        for (const placement of flow.placements) cardIds.push(placement.config.id);
    }
    FLOW_SEQUENCE = maxIdSuffix(flowIds, FLOW_ID_PATTERN);
    SEQUENCE = maxIdSuffix(cardIds, CARD_ID_PATTERN);
}

function defaultCardConfig(): FlowCardConfig {
    return {
        id: nextCardId(),
        name: "New node",
        triggerType: "",
        conditions: [],
        waitValue: null,
        waitUnit: "minutes",
    };
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

function compactPlacements(placements: readonly FlowCardPlacement[]): readonly FlowCardPlacement[] {
    if (placements.length === 0) return placements;
    const sortedRows = [...new Set(placements.map((p) => p.row))].sort((a, b) => a - b);
    const sortedCols = [...new Set(placements.map((p) => p.col))].sort((a, b) => a - b);
    const rowMap = new Map(sortedRows.map((r, i) => [r, i] as const));
    const colMap = new Map(sortedCols.map((c, i) => [c, i] as const));
    return placements.map((p) => ({ ...p, row: rowMap.get(p.row)!, col: colMap.get(p.col)! }));
}

function compactFlow(flow: FlowMeta): FlowMeta {
    return { ...flow, placements: compactPlacements(flow.placements) };
}

function loadStoredFlows(): readonly FlowMeta[] {
    const stored = readStored<readonly FlowMeta[]>(STORAGE_KEY);
    if (!stored || stored.length === 0) return [defaultFlowMeta()];
    return stored.map(compactFlow);
}

function dedupeFlowIds(flows: readonly FlowMeta[]): readonly FlowMeta[] {
    const seenFlow = new Set<string>();
    return flows.map((flow) => {
        const flowId = seenFlow.has(flow.id) ? nextFlowId() : flow.id;
        seenFlow.add(flowId);
        const seenCard = new Set<string>();
        const placements = flow.placements.map((p) => {
            const cardId = seenCard.has(p.config.id) ? nextCardId() : p.config.id;
            seenCard.add(cardId);
            if (cardId === p.config.id && flowId === flow.id) return p;
            return { ...p, config: { ...p.config, id: cardId } };
        });
        return { ...flow, id: flowId, placements };
    });
}

const rawStoredFlows = loadStoredFlows();
seedSequences(rawStoredFlows);
const storedFlows = dedupeFlowIds(rawStoredFlows);

export const flowMetaSignal: Signal<FlowMeta> = signal<FlowMeta>(storedFlows[0]!);
export const flowsListSignal: Signal<readonly FlowMeta[]> = signal<readonly FlowMeta[]>(storedFlows);

export function placementsCurrent(): readonly FlowCardPlacement[] {
    return flowMetaSignal().placements;
}

function setMeta(patch: Partial<FlowMeta>): void {
    flowMetaSignal.set({ ...flowMetaSignal(), ...patch });
}

function setPlacements(next: readonly FlowCardPlacement[]): void {
    setMeta({ placements: compactPlacements(next) });
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
    const target = placementsCurrent().find((p) => p.config.id === id);
    if (target && target.row === 0 && target.col === 0) return;
    const remaining = placementsCurrent().filter((p) => p.config.id !== id);
    setPlacements(remaining);
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
    const updated = [...flowsListSignal(), fresh];
    flowsListSignal.set(updated);
    flowMetaSignal.set(fresh);
    writeStored(STORAGE_KEY, updated);
}

export function persistCurrentToList(): void {
    const current = flowMetaSignal();
    const updated = flowsListSignal().map((f) => (f.id === current.id ? current : f));
    flowsListSignal.set(updated);
    writeStored(STORAGE_KEY, updated);
}
