import type { AnimationPresetDefinition } from "../../../types/voxlab/preset-def-types.js";
import { hueCycle } from "./material/material-hue-cycle.js";
import { glowPulse } from "./material/material-glow-pulse.js";
import { fadeIn, fadeOut } from "./material/preset-material-fade.js";
import { metallicSweep } from "./material/material-metallic-sweep.js";
import { emissiveThrob } from "./material/material-emissive-throb.js";

export const MATERIAL_PRESETS: ReadonlyArray<AnimationPresetDefinition> = [
    hueCycle,
    glowPulse,
    fadeIn,
    fadeOut,
    metallicSweep,
    emissiveThrob,
];
