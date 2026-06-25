import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { lerpHex, readString, sample, sampleColor, track } from "../presets-utils.js";

export const emissiveThrob: AnimationPresetDefinition = {
    id: "material.emissiveThrob",
    name: "Emissive Throb",
    category: "Material",
    defaultDurationMs: 3000,
    generate(ctx) {
        const baseColor = readString(ctx.snapshot, "emissive", "emissiveColor", "#321f0a");
        return [
            track(
                "emissive.emissiveIntensity",
                "number",
                sample(ctx.durationMs, 16, (u) => 0.1 + Math.abs(Math.sin(u * Math.PI * 3)) * 1.5),
            ),
            track(
                "emissive.emissiveColor",
                "color",
                sampleColor(ctx.durationMs, 16, (u) =>
                    lerpHex(baseColor, "#ffd089", 0.3 + 0.4 * Math.sin(u * Math.PI * 3)),
                ),
            ),
        ];
    },
};
