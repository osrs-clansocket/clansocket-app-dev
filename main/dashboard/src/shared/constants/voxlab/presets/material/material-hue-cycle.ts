import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { hslHex, sampleColor, track } from "../presets-utils.js";

export const hueCycle: AnimationPresetDefinition = {
    id: "material.hueCycle",
    name: "Hue Cycle",
    category: "Material",
    defaultDurationMs: 4000,
    generate(ctx) {
        return [
            track(
                "surface.tint",
                "color",
                sampleColor(ctx.durationMs, 12, (u) => hslHex(u * 360, 70, 60)),
            ),
        ];
    },
};
