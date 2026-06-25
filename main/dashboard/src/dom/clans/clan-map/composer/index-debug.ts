import { REGION_PX_DEFAULT } from "../../../../shared/constants/clan/clan-map-constants.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import type { MapStateDims, MapStateSignals } from "../internal/state.js";

export function attachMapDebug(state: MapStateSignals): void {
    const dbg = window as unknown as { __clanMap?: unknown };
    dbg.__clanMap = {
        getViewport: (): AtlasBox => state.viewport$(),
        getMapStateDims: (): MapStateDims => state.canvasDims$(),
        getScale: (): number => {
            const v = state.viewport$();
            const d = state.canvasDims$();
            return Math.min(d.w / v.w, d.h / v.h);
        },
        getRenderPxPerRegion: (): number => {
            const v = state.viewport$();
            const d = state.canvasDims$();
            return REGION_PX_DEFAULT * Math.min(d.w / v.w, d.h / v.h);
        },
    };
}
