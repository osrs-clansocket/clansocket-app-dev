import type { LightSettings } from "../../../types/voxlab/light-types.js";

export const DEFAULT_LIGHTING: LightSettings = {
    ambientIntensity: 0.45,
    keyIntensity: 1.1,
    keyPositionX: 2,
    keyPositionY: 3,
    keyPositionZ: 2.5,
    fillIntensity: 0.4,
    fillColor: "#f5ca7a",
    fillPositionX: -2.5,
    fillPositionY: -1,
    fillPositionZ: -2,
    shadowBias: -0.0005,
    shadowRadius: 4,
};
