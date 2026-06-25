import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";

export interface BlipAnimState {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    startMs: number;
    durationMs: number;
    lastUpdateMs: number;
    lastPlane: number;
}

export type AnimRow = PositionsState["byHash"] extends Map<string, infer R> ? R : never;
