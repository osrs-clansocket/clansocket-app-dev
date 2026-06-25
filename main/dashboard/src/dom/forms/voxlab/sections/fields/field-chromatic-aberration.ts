import type { EffectsSettings } from "../../../../../shared/types/voxlab/effects-types.js";

export type ChromaticAberrationFields = Pick<
    EffectsSettings,
    "chromaticAberrationEnabled" | "chromaticAberrationAmount"
>;
