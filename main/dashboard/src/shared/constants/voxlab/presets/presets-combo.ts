import type { AnimationPresetDefinition } from "../../../types/voxlab/preset-def-types.js";
import { hover } from "./combo/preset-combo-hover.js";
import { reveal } from "./combo/preset-combo-reveal.js";
import { floatCombo } from "./combo/preset-combo-float.js";
import { heroDrop } from "./combo/combo-hero-drop.js";
import { stealth } from "./combo/preset-combo-stealth.js";
import { showcase } from "./combo/preset-combo-showcase.js";

export const COMBO_PRESETS: ReadonlyArray<AnimationPresetDefinition> = [
    hover,
    reveal,
    floatCombo,
    heroDrop,
    stealth,
    showcase,
];
