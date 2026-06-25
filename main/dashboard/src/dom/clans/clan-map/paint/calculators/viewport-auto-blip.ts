import type { PositionRow, PositionsMapMeta } from "../../../../../state/clans/stores/positions-store.js";
import type { AtlasBox } from "../../../../../shared/types/view-types.js";
import { rowToPx } from "../mappers/coordinate-mapper.js";
import { aspectFit } from "./viewport-auto.js";

export interface AroundBlipArgs {
    row: PositionRow;
    meta: PositionsMapMeta;
    regionPx: number;
    regions: number;
    canvasAspect: number;
    maxDim: number;
}

export function viewportAroundBlip(a: AroundBlipArgs): AtlasBox {
    const { row, meta, regionPx, regions, canvasAspect, maxDim } = a;
    const { ix, iy } = rowToPx(row, meta);
    const snappedMinX = Math.floor(ix / regionPx) * regionPx;
    const snappedMinY = Math.floor(iy / regionPx) * regionPx;
    const baseDim = regions * regionPx;
    const { w: vpW, h: vpH } = aspectFit(baseDim, baseDim, canvasAspect, maxDim);
    const blipCenterX = snappedMinX + regionPx / 2;
    const blipCenterY = snappedMinY + regionPx / 2;
    return {
        x: blipCenterX - vpW / 2,
        y: blipCenterY - vpH / 2,
        w: vpW,
        h: vpH,
    };
}
