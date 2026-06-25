import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const fadeIn: AnimationPresetDefinition = {
    id: "material.fadeIn",
    name: "Fade In",
    category: "Material",
    defaultDurationMs: 1000,
    generate(ctx) {
        return [
            track(
                "surface.opacity",
                "number",
                sample(ctx.durationMs, 4, (u) => u),
            ),
        ];
    },
};

export const fadeOut: AnimationPresetDefinition = {
    id: "material.fadeOut",
    name: "Fade Out",
    category: "Material",
    defaultDurationMs: 1000,
    generate(ctx) {
        return [
            track(
                "surface.opacity",
                "number",
                sample(ctx.durationMs, 4, (u) => 1 - u),
            ),
        ];
    },
};
