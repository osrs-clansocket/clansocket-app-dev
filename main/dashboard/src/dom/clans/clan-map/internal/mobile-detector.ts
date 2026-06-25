import { MIN_VIEWPORT_REGIONS } from "../../../../shared/constants/clan/clan-map-constants.js";

const MOBILE_MQ = "(max-width: 48rem)";
const MIN_VIEWPORT_REGIONS_MOBILE = 1;

export function currentMinRegions(): number {
    return window.matchMedia(MOBILE_MQ).matches ? MIN_VIEWPORT_REGIONS_MOBILE : MIN_VIEWPORT_REGIONS;
}
