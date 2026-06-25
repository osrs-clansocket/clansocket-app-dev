import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { orbitState, readNumber, sample, track } from "../presets-utils.js";

export const showcase: AnimationPresetDefinition = {
    id: "combo.showcase",
    name: "Showcase",
    category: "Combo",
    defaultDurationMs: 4000,
    description: "Orbit + bloom throb.",
    generate(ctx) {
        const o = orbitState(ctx.snapshot);
        const bb = readNumber(ctx.snapshot, "bloom", "bloomStrength", 0.6);
        return [
            track(
                "camera.positionX",
                "number",
                sample(ctx.durationMs, 16, (u) => o.tx + Math.cos(o.phase0 + u * Math.PI * 2) * o.radius),
            ),
            track(
                "camera.positionZ",
                "number",
                sample(ctx.durationMs, 16, (u) => o.tz + Math.sin(o.phase0 + u * Math.PI * 2) * o.radius),
            ),
            track(
                "bloom.bloomStrength",
                "number",
                sample(ctx.durationMs, 16, (u) => bb + Math.abs(Math.sin(u * Math.PI * 4)) * 0.6),
            ),
        ];
    },
};
