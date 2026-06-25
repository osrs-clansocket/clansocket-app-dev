import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { REGION_PX_DEFAULT } from "../../../../shared/constants/clan/clan-map-constants.js";

export function regionPxOf(state: PositionsState): number {
    return state.mapMeta?.region_px ?? REGION_PX_DEFAULT;
}
