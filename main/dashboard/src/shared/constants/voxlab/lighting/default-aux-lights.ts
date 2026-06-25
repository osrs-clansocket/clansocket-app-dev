import type { BottomLightSettings, RimLightSettings, TopLightSettings } from "../../../types/voxlab/light-types.js";

export const DEFAULT_RIM_LIGHT: RimLightSettings = {
    intensity: 0.8,
    color: "#ffffff",
    positionX: -2.0,
    positionY: 1.5,
    positionZ: -3.0,
};

export const DEFAULT_TOP_LIGHT: TopLightSettings = {
    intensity: 0.6,
    color: "#ffffff",
};

export const DEFAULT_BOTTOM_LIGHT: BottomLightSettings = {
    intensity: 0.2,
    color: "#f5ca7a",
};
