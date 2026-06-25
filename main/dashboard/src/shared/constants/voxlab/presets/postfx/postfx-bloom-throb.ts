import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const bloomThrob: AnimationPresetDefinition = {
    id: "postfx.bloomThrob",
    name: "Bloom Throb",
    category: "Post-FX",
    defaultDurationMs: 2500,
    generate(ctx) {
        const base = readNumber(ctx.snapshot, "bloom", "bloomStrength", 0.6);
        return [
            track(
                "bloom.bloomStrength",
                "number",
                sample(ctx.durationMs, 14, (u) => base + Math.abs(Math.sin(u * Math.PI * 2)) * 1.0),
            ),
        ];
    },
};
