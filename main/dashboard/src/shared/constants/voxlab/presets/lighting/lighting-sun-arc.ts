import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { sample, track } from "../presets-utils.js";

export const sunArc: AnimationPresetDefinition = {
    id: "lighting.sunArc",
    name: "Sun Arc",
    category: "Lighting",
    defaultDurationMs: 4000,
    generate(ctx) {
        return [
            track(
                "keyLight.keyPositionX",
                "number",
                sample(ctx.durationMs, 10, (u) => Math.cos(u * Math.PI) * 4),
            ),
            track(
                "keyLight.keyPositionY",
                "number",
                sample(ctx.durationMs, 10, (u) => Math.abs(Math.sin(u * Math.PI)) * 5),
            ),
        ];
    },
};
