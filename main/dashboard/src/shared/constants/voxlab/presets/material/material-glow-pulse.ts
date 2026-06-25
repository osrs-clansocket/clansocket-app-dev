import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const glowPulse: AnimationPresetDefinition = {
    id: "material.glowPulse",
    name: "Glow Pulse",
    category: "Material",
    defaultDurationMs: 2000,
    generate(ctx) {
        const base = readNumber(ctx.snapshot, "emissive", "emissiveIntensity", 0);
        return [
            track(
                "emissive.emissiveIntensity",
                "number",
                sample(ctx.durationMs, 12, (u) => base + Math.abs(Math.sin(u * Math.PI * 2)) * 1.2),
            ),
        ];
    },
};
