import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const chromaticWave: AnimationPresetDefinition = {
    id: "postfx.chromaticWave",
    name: "Chromatic Wave",
    category: "Post-FX",
    defaultDurationMs: 3000,
    generate(ctx) {
        return [
            track(
                "chromaticAberration.chromaticAberrationAmount",
                "number",
                sample(ctx.durationMs, 12, (u) => 0.05 + Math.abs(Math.sin(u * Math.PI * 3)) * 0.4),
            ),
        ];
    },
};
