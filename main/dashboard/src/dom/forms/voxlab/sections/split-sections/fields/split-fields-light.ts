import type { LightSettings } from "../../../../../../shared/types/voxlab/light-types.js";

export type AmbientFields = Pick<LightSettings, "ambientIntensity">;
export type KeyLightFields = Pick<
    LightSettings,
    "keyIntensity" | "keyPositionX" | "keyPositionY" | "keyPositionZ" | "shadowBias" | "shadowRadius"
>;
export type FillLightFields = Pick<
    LightSettings,
    "fillIntensity" | "fillColor" | "fillPositionX" | "fillPositionY" | "fillPositionZ"
>;
