import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const heroDrop: AnimationPresetDefinition = {
    id: "combo.heroDrop",
    name: "Hero Drop",
    category: "Combo",
    defaultDurationMs: 1800,
    description: "Spin in + emissive glow.",
    generate(ctx) {
        return [
            track(
                "mesh.scale",
                "number",
                sample(ctx.durationMs, 8, (u) => 0.1 + 0.9 * Math.min(1, u * 1.4)),
            ),
            track(
                "emissive.emissiveIntensity",
                "number",
                sample(ctx.durationMs, 8, (u) => Math.max(0, 1.5 - u * 1.5)),
            ),
            track(
                "surface.opacity",
                "number",
                sample(ctx.durationMs, 4, (u) => Math.min(1, u * 2)),
            ),
        ];
    },
};
