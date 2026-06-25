import type { AnimRow, BlipAnimState } from "./blip-state-types.js";

export function initialBlipPos(row: AnimRow, nowMs: number): BlipAnimState {
    return {
        fromX: row.location_x,
        fromY: row.location_y,
        toX: row.location_x,
        toY: row.location_y,
        startMs: nowMs,
        durationMs: 0,
        lastUpdateMs: nowMs,
        lastPlane: row.location_plane,
    };
}
