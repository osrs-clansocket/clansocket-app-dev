import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const reveal: AnimationPresetDefinition = {
    id: "combo.reveal",
    name: "Reveal",
    category: "Combo",
    defaultDurationMs: 2000,
    description: "Push + fade-in.",
    generate(ctx) {
        const cz = readNumber(ctx.snapshot, "camera", "positionZ", 1.6);
        return [
            track(
                "camera.positionZ",
                "number",
                sample(ctx.durationMs, 6, (u) => cz * (1 + (1 - u) * 0.6)),
            ),
            track(
                "surface.opacity",
                "number",
                sample(ctx.durationMs, 6, (u) => u),
            ),
        ];
    },
};
