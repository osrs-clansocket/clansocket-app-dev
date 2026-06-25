import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { BlipAnimState } from "./blip-position-mover.js";
import { updateRowAnim } from "./blip-anim-row.js";

export function updateAnimations(animations: Map<string, BlipAnimState>, state: PositionsState, nowMs: number): void {
    for (const [hash, row] of state.byHash) updateRowAnim(animations, hash, row, nowMs);
    for (const hash of animations.keys()) {
        if (!state.byHash.has(hash)) animations.delete(hash);
    }
}
