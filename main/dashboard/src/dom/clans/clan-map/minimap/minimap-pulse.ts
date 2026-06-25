import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { drawPulse } from "../paint/painters/pulse-painter.js";
import { SCALE_X, SCALE_Y } from "./minimap-dimensions.js";

export const PULSE_CYCLE_MS = 1400;
export const ALERT_ALPHA_MIN = 0.15;
export const ALERT_ALPHA_MAX = 1.0;

const PULSE_BASE_RADIUS = 2;
const PULSE_MAX_RING = 5;

export interface MinimapPaintCtx {
    ctx: CanvasRenderingContext2D;
    positions: PositionsState;
    plane: number;
    alertedHashes: ReadonlySet<string>;
    meta: NonNullable<PositionsState["mapMeta"]>;
}

export function paintMinimapPulses(p: MinimapPaintCtx, nowMs: number): void {
    const { ctx, positions, plane, alertedHashes, meta } = p;
    for (const row of positions.byHash.values()) {
        if (row.location_plane !== plane || !alertedHashes.has(row.account_hash)) continue;
        const ix = (row.location_x - meta.origin_world_x) * meta.pixels_per_tile;
        const iy = (meta.top_world_y - row.location_y) * meta.pixels_per_tile;
        drawPulse({
            ctx,
            nowMs,
            px: ix * SCALE_X,
            py: iy * SCALE_Y,
            baseRadius: PULSE_BASE_RADIUS,
            maxRingRadius: PULSE_MAX_RING,
        });
    }
}
