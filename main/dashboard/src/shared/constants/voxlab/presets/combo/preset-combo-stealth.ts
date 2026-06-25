import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { halfOrbitTracks, orbitState, readNumber, sample, track } from "../presets-utils.js";

export const stealth: AnimationPresetDefinition = {
    id: "combo.stealth",
    name: "Stealth",
    category: "Combo",
    defaultDurationMs: 5000,
    description: "Slow orbit + dim ramp.",
    generate(ctx) {
        const o = orbitState(ctx.snapshot);
        const ki = readNumber(ctx.snapshot, "keyLight", "keyIntensity", 1.1);
        return [
            ...halfOrbitTracks(ctx.durationMs, o, 16),
            track(
                "keyLight.keyIntensity",
                "number",
                sample(ctx.durationMs, 8, (u) => ki * (0.4 + 0.3 * Math.cos(u * Math.PI * 2))),
            ),
            track(
                "vignette.vignetteAmount",
                "number",
                sample(ctx.durationMs, 8, (u) => 0.3 + 0.4 * u),
            ),
        ];
    },
};
