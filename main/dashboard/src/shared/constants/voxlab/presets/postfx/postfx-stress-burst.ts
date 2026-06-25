import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const stressBurst: AnimationPresetDefinition = {
    id: "postfx.stressBurst",
    name: "Stress Burst",
    category: "Post-FX",
    defaultDurationMs: 1500,
    generate(ctx) {
        return [
            track(
                "stress.radius",
                "number",
                sample(ctx.durationMs, 10, (u) => 0.3 + Math.abs(Math.sin(u * Math.PI * 4)) * 1.2),
            ),
        ];
    },
};
