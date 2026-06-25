import type { AnimRow, BlipAnimState } from "./blip-state-types.js";
import { blipPositionAt } from "./blip-position-at.js";

const TELEPORT_TILES = 8;
const MIN_DURATION_MS = 200;
const MAX_DURATION_MS = 2000;
const DURATION_MULTIPLIER = 1.5;

export function applyBlipPos(existing: BlipAnimState, row: AnimRow, nowMs: number): void {
    const planeChanged = existing.lastPlane !== row.location_plane;
    const dx = row.location_x - existing.toX;
    const dy = row.location_y - existing.toY;
    const dist = Math.max(Math.abs(dx), Math.abs(dy));
    if (planeChanged || dist >= TELEPORT_TILES) {
        existing.fromX = row.location_x;
        existing.fromY = row.location_y;
        existing.toX = row.location_x;
        existing.toY = row.location_y;
        existing.durationMs = 0;
    } else {
        const interval = nowMs - existing.lastUpdateMs;
        const cur = blipPositionAt(existing, nowMs);
        existing.fromX = cur.x;
        existing.fromY = cur.y;
        existing.toX = row.location_x;
        existing.toY = row.location_y;
        existing.durationMs = Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, interval * DURATION_MULTIPLIER));
    }
    existing.startMs = nowMs;
    existing.lastUpdateMs = nowMs;
    existing.lastPlane = row.location_plane;
}
