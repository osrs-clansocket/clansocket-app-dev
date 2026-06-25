import type { SceneSnapshot } from "../../../shared/types/voxlab/snapshot-types.js";

const NUMBER_EPSILON = 1e-6;

export interface HistoryEntry {
    path: string;
    prevValue: unknown;
    nextValue: unknown;
    timestamp: number;
}

export interface HistoryChange {
    path: string;
    currentValue: unknown;
    defaultValue: unknown;
}

export function cloneSnapshot(snapshot: SceneSnapshot): SceneSnapshot {
    return { ...snapshot, parts: { ...snapshot.parts } };
}

export function historyValuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= NUMBER_EPSILON;
    if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase();
    return false;
}
