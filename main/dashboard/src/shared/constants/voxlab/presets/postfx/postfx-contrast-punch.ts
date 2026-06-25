import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { track } from "../presets-utils.js";

export const contrastPunch: AnimationPresetDefinition = {
    id: "postfx.contrastPunch",
    name: "Contrast Punch",
    category: "Post-FX",
    defaultDurationMs: 800,
    generate(ctx) {
        return [
            track("contrast.contrastAmount", "number", [
                { t: 0, v: 0 },
                { t: ctx.durationMs * 0.2, v: 0.6 },
                { t: ctx.durationMs * 0.5, v: 0.15 },
                { t: ctx.durationMs * 0.8, v: 0.35 },
                { t: ctx.durationMs, v: 0 },
            ]),
        ];
    },
};
