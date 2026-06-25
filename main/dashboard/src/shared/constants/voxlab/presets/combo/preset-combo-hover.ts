import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const hover: AnimationPresetDefinition = {
    id: "combo.hover",
    name: "Hover",
    category: "Combo",
    defaultDurationMs: 3000,
    generate(ctx) {
        const cy = readNumber(ctx.snapshot, "camera", "positionY", 0.9);
        return [
            track(
                "camera.positionY",
                "number",
                sample(ctx.durationMs, 12, (u) => cy + Math.sin(u * Math.PI * 2) * 0.15),
            ),
            track(
                "mesh.scale",
                "number",
                sample(ctx.durationMs, 12, (u) => 1 + Math.sin(u * Math.PI * 2) * 0.04),
            ),
        ];
    },
};
