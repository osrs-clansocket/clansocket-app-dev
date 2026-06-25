import { applyBlipPos, initialBlipPos, type BlipAnimState } from "./blip-position-mover.js";
import type { AnimRow } from "./blip-state-types.js";

export function updateRowAnim(animations: Map<string, BlipAnimState>, hash: string, row: AnimRow, nowMs: number): void {
    const existing = animations.get(hash);
    if (existing === undefined) {
        animations.set(hash, initialBlipPos(row, nowMs));
        return;
    }
    const posSame = existing.toX === row.location_x && existing.toY === row.location_y;
    const planeSame = existing.lastPlane === row.location_plane;
    if (posSame && planeSame) return;
    applyBlipPos(existing, row, nowMs);
}
