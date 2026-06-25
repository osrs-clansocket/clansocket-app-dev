import {
    isPositionActive,
    type PositionRow,
    type PositionsState,
} from "../../../../../state/clans/stores/positions-store.js";
import { ENGAGED_MS } from "../../../../../shared/constants/clan/clan-map-constants.js";
import type { BlipPx } from "../../../../../shared/types/blip-types.js";
import type { CompositeView } from "../../../../../shared/types/view-types.js";
import { worldToPx } from "../mappers/coordinate-mapper.js";
import { rowsForPlane } from "../resolvers/plane-resolver.js";
import type { BlipPositionAnimator } from "../animators/blip-position-animator.js";

function isEngaged(row: PositionRow, nowMs: number): boolean {
    const dealt = row.last_damage_dealt_at;
    const taken = row.last_damage_taken_at;
    if (dealt !== null && nowMs - dealt < ENGAGED_MS) return true;
    if (taken !== null && nowMs - taken < ENGAGED_MS) return true;
    return false;
}

interface BlipPxArgs {
    row: PositionRow;
    view: CompositeView;
    ix: number;
    iy: number;
    nowMs: number;
}

function blipPxFor(args: BlipPxArgs): BlipPx {
    const { row, view, ix, iy, nowMs } = args;
    return {
        accountHash: row.account_hash,
        name: row.latest_rsn,
        px: ix * view.scale + view.offsetX,
        py: iy * view.scale + view.offsetY,
        engaged: isEngaged(row, nowMs),
        isActive: isPositionActive(row),
    };
}

export function collectBlips(
    state: PositionsState,
    plane: number,
    view: CompositeView,
    animator: BlipPositionAnimator,
): BlipPx[] {
    const meta = state.mapMeta;
    if (meta === null) return [];
    const nowMs = Date.now();
    const perfNowMs = performance.now();
    const out: BlipPx[] = [];
    for (const row of rowsForPlane(state, plane)) {
        const interp = animator.getInterpolated(row.account_hash, perfNowMs);
        const worldX = interp === null ? row.location_x : interp.x;
        const worldY = interp === null ? row.location_y : interp.y;
        const { ix, iy } = worldToPx(worldX, worldY, meta);
        out.push(blipPxFor({ row, view, ix, iy, nowMs }));
    }
    return out;
}
