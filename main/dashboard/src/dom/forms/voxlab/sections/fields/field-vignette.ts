import type { EffectsSettings } from "../../../../../shared/types/voxlab/effects-types.js";

export type VignetteFields = Pick<EffectsSettings, "vignetteEnabled" | "vignetteAmount" | "vignetteColor">;
