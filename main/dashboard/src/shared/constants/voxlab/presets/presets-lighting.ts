import type { AnimationPresetDefinition } from "../../../types/voxlab/preset-def-types.js";
import { sunArc } from "./lighting/lighting-sun-arc.js";
import { lightPulse } from "./lighting/preset-lighting-pulse.js";
import { colorTempShift } from "./lighting/lighting-color-temp.js";
import { tripleLightCycle } from "./lighting/lighting-triple-cycle.js";
import { stageFlicker } from "./lighting/preset-lighting-flicker.js";

export const LIGHTING_PRESETS: ReadonlyArray<AnimationPresetDefinition> = [
    sunArc,
    lightPulse,
    colorTempShift,
    tripleLightCycle,
    stageFlicker,
];
