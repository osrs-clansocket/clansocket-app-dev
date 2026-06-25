import type { AnimationPresetDefinition } from "../../../types/voxlab/preset-def-types.js";
import { bloomThrob } from "./postfx/postfx-bloom-throb.js";
import { vignetteBreath } from "./postfx/postfx-vignette-breath.js";
import { contrastPunch } from "./postfx/postfx-contrast-punch.js";
import { chromaticWave } from "./postfx/postfx-chromatic-wave.js";
import { stressBurst } from "./postfx/postfx-stress-burst.js";
import { fxaaEdgeWave } from "./postfx/fxaa-edge-wave.js";

export const POSTFX_PRESETS: ReadonlyArray<AnimationPresetDefinition> = [
    bloomThrob,
    vignetteBreath,
    contrastPunch,
    chromaticWave,
    stressBurst,
    fxaaEdgeWave,
];
