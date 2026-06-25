import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import { MAINLAND_DEFAULT } from "../../../../../shared/constants/clan/clan-map-constants.js";
import { rowsForPlane } from "../resolvers/plane-resolver.js";
import { computeRowBounds } from "./viewport-bounds.js";
import { snapBounds } from "./viewport-snap.js";
import { viewportFromSnapped } from "./viewport-from-snapped.js";

export { viewportAroundBlip, type AroundBlipArgs } from "./viewport-auto-blip.js";
export { aspectFit } from "./viewport-aspect.js";

export interface AutoViewportArgs {
    state: PositionsState;
    plane: number;
    regionPx: number;
    canvasAspect: number;
    maxDim: number;
}

export function autoViewport(a: AutoViewportArgs): AtlasBox {
    const { state, plane, regionPx, canvasAspect, maxDim } = a;
    const meta = state.mapMeta;
    if (meta === null) return MAINLAND_DEFAULT;
    const rows = rowsForPlane(state, plane);
    if (rows.length === 0) return MAINLAND_DEFAULT;
    return viewportFromSnapped(snapBounds(computeRowBounds(rows, meta), regionPx), regionPx, canvasAspect, maxDim);
}
