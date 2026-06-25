import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const metallicSweep: AnimationPresetDefinition = {
    id: "material.metallicSweep",
    name: "Metallic Sweep",
    category: "Material",
    defaultDurationMs: 2500,
    generate(ctx) {
        const base = readNumber(ctx.snapshot, "surface", "metalness", 0.25);
        return [
            track(
                "surface.metalness",
                "number",
                sample(ctx.durationMs, 8, (u) => base + (1 - base) * Math.abs(Math.sin(u * Math.PI))),
            ),
            track(
                "surface.roughness",
                "number",
                sample(ctx.durationMs, 8, (u) => 0.05 + 0.5 * (1 - Math.abs(Math.sin(u * Math.PI)))),
            ),
        ];
    },
};
