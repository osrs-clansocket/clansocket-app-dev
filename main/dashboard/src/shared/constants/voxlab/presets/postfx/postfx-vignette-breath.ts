import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const vignetteBreath: AnimationPresetDefinition = {
    id: "postfx.vignetteBreath",
    name: "Vignette Breath",
    category: "Post-FX",
    defaultDurationMs: 4000,
    generate(ctx) {
        return [
            track(
                "vignette.vignetteAmount",
                "number",
                sample(ctx.durationMs, 10, (u) => 0.1 + 0.6 * (Math.sin(u * Math.PI * 2) * 0.5 + 0.5)),
            ),
        ];
    },
};
