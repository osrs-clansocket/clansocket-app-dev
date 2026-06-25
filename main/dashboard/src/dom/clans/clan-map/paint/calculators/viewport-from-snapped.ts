import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import { MIN_VIEWPORT_REGIONS } from "../../../../../shared/constants/clan/clan-map-constants.js";
import { aspectFit } from "./viewport-aspect.js";
import type { snapBounds } from "./viewport-snap.js";

export function viewportFromSnapped(
    snapped: ReturnType<typeof snapBounds>,
    regionPx: number,
    canvasAspect: number,
    maxDim: number,
): AtlasBox {
    const minDim = MIN_VIEWPORT_REGIONS * regionPx;
    const { w: vpW, h: vpH } = aspectFit(
        Math.max(snapped.maxY - snapped.minY, minDim),
        Math.max(snapped.maxX - snapped.minX, minDim),
        canvasAspect,
        maxDim,
    );
    return {
        x: (snapped.minX + snapped.maxX) / 2 - vpW / 2,
        y: (snapped.minY + snapped.maxY) / 2 - vpH / 2,
        w: vpW,
        h: vpH,
    };
}
