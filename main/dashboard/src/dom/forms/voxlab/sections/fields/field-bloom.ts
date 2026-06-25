import type { EffectsSettings } from "../../../../../shared/types/voxlab/effects-types.js";

export type BloomFields = Pick<EffectsSettings, "bloomEnabled" | "bloomStrength" | "bloomRadius" | "bloomThreshold">;
