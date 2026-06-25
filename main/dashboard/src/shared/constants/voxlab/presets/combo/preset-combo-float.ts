import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { orbitState, sample, track } from "../presets-utils.js";

export const floatCombo: AnimationPresetDefinition = {
    id: "combo.float",
    name: "Float",
    category: "Combo",
    defaultDurationMs: 4000,
    description: "Slow orbit + gentle vertical drift.",
    generate(ctx) {
        const o = orbitState(ctx.snapshot);
        return [
            track(
                "camera.positionX",
                "number",
                sample(ctx.durationMs, 14, (u) => o.tx + Math.cos(o.phase0 + u * Math.PI * 2) * o.radius),
            ),
            track(
                "camera.positionZ",
                "number",
                sample(ctx.durationMs, 14, (u) => o.tz + Math.sin(o.phase0 + u * Math.PI * 2) * o.radius),
            ),
            track(
                "camera.positionY",
                "number",
                sample(ctx.durationMs, 14, (u) => o.cy + Math.sin(u * Math.PI * 4) * 0.12),
            ),
        ];
    },
};
