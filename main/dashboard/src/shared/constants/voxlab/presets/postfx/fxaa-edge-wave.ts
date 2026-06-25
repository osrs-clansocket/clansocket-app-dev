import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const fxaaEdgeWave: AnimationPresetDefinition = {
    id: "postfx.fxaaEdgeWave",
    name: "FXAA Edge Wave",
    category: "Post-FX",
    defaultDurationMs: 2000,
    generate(ctx) {
        return [
            track(
                "outline.outlineThickness",
                "number",
                sample(ctx.durationMs, 10, (u) => 0.5 + Math.abs(Math.sin(u * Math.PI * 2)) * 4.5),
            ),
        ];
    },
};
