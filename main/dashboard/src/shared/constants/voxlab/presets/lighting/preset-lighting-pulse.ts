import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const lightPulse: AnimationPresetDefinition = {
    id: "lighting.lightPulse",
    name: "Light Pulse",
    category: "Lighting",
    defaultDurationMs: 1800,
    generate(ctx) {
        const base = readNumber(ctx.snapshot, "keyLight", "keyIntensity", 1.1);
        return [
            track(
                "keyLight.keyIntensity",
                "number",
                sample(ctx.durationMs, 12, (u) => base * (0.6 + 0.7 * Math.abs(Math.sin(u * Math.PI * 2)))),
            ),
        ];
    },
};
