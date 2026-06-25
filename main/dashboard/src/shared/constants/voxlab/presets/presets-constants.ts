import type { AnimationPresetDefinition } from "../../../types/voxlab/preset-def-types.js";
import { CAMERA_PRESETS } from "./presets-camera.js";
import { MATERIAL_PRESETS } from "./presets-material.js";
import { LIGHTING_PRESETS } from "./presets-lighting.js";
import { POSTFX_PRESETS } from "./presets-postfx.js";
import { COMBO_PRESETS } from "./presets-combo.js";

export const BUILTIN_ANIMATION_PRESETS: ReadonlyArray<AnimationPresetDefinition> = [
    ...CAMERA_PRESETS,
    ...MATERIAL_PRESETS,
    ...LIGHTING_PRESETS,
    ...POSTFX_PRESETS,
    ...COMBO_PRESETS,
];
