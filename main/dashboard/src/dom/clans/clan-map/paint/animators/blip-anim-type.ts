import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";

export interface BlipPositionAnimator {
    update(state: PositionsState, nowMs: number): void;
    getInterpolated(accountHash: string, nowMs: number): { x: number; y: number } | null;
    hasActive(nowMs: number): boolean;
}
