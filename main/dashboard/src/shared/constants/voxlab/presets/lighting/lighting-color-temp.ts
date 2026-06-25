import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { lerpHex, sampleColor, track } from "../presets-utils.js";

export const colorTempShift: AnimationPresetDefinition = {
    id: "lighting.colorTempShift",
    name: "Color Temp Shift",
    category: "Lighting",
    defaultDurationMs: 3500,
    generate(ctx) {
        return [
            track(
                "fillLight.fillColor",
                "color",
                sampleColor(ctx.durationMs, 6, (u) => lerpHex("#ffb15a", "#7aa7d8", u)),
            ),
        ];
    },
};
