import type { EffectsSettings } from "../../../../../shared/types/voxlab/effects-types.js";

export type QualityFields = Pick<EffectsSettings, "fxaaEnabled" | "msaaSamples" | "supersample">;
