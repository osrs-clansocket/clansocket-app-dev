import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { REGION_PX_DEFAULT } from "../../../../shared/constants/clan/clan-map-constants.js";
import { currentMinRegions } from "./mobile-detector.js";

const ATLAS_W_FALLBACK = 13056;
const ATLAS_H_FALLBACK = 45568;

let cachedRegionPx = REGION_PX_DEFAULT;
let cachedAtlasW = ATLAS_W_FALLBACK;
let cachedAtlasH = ATLAS_H_FALLBACK;

export function updateAtlasCache(meta: PositionsState["mapMeta"]): void {
    cachedRegionPx = meta?.region_px ?? REGION_PX_DEFAULT;
    if (meta !== null) {
        cachedAtlasW = meta.width;
        cachedAtlasH = meta.height;
    }
}

export function atlasCacheDims(): { width: number; height: number; min: number } {
    return {
        width: cachedAtlasW,
        height: cachedAtlasH,
        min: currentMinRegions() * cachedRegionPx,
    };
}
