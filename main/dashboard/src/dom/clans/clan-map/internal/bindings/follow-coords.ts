import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { BlipPositionAnimator } from "../../paint/animators/blip-position-animator.js";

export function followedWorldCoords(
    row: NonNullable<ReturnType<PositionsState["byHash"]["get"]>>,
    mapMeta: NonNullable<PositionsState["mapMeta"]>,
    animator: BlipPositionAnimator,
    hash: string,
): { ix: number; iy: number } {
    const interp = animator.getInterpolated(hash, performance.now());
    const worldX = interp === null ? row.location_x : interp.x;
    const worldY = interp === null ? row.location_y : interp.y;
    return {
        ix: (worldX - mapMeta.origin_world_x) * mapMeta.pixels_per_tile,
        iy: (mapMeta.top_world_y - worldY) * mapMeta.pixels_per_tile,
    };
}
