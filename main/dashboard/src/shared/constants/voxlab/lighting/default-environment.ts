import type { EnvironmentSettings, HemisphereSettings } from "../../../types/voxlab/light-types.js";

export const DEFAULT_ENVIRONMENT: EnvironmentSettings = {
    enabled: true,
    intensity: 1.0,
    hdrName: null,
};

export const DEFAULT_HEMISPHERE: HemisphereSettings = {
    skyColor: "#d8e6f2",
    groundColor: "#3a2d1a",
    intensity: 0.5,
};

export const ENV_INTENSITY_MAX = 3;
