import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import type { GeneratedKeyframe } from "../../../../types/voxlab/preset-track-types.js";
import { readNumber, track } from "../presets-utils.js";

export const stageFlicker: AnimationPresetDefinition = {
    id: "lighting.stageFlicker",
    name: "Stage Flicker",
    category: "Lighting",
    defaultDurationMs: 1200,
    generate(ctx) {
        const base = readNumber(ctx.snapshot, "ambient", "ambientIntensity", 0.45);
        const samples: GeneratedKeyframe[] = [];
        for (let i = 0; i <= 18; i++) {
            const u = i / 18;
            const noise = Math.sin(u * 60) * 0.5 + Math.sin(u * 23) * 0.5;
            samples.push({ t: u * ctx.durationMs, v: Math.max(0.05, base + noise * 0.4) });
        }
        return [track("ambient.ambientIntensity", "number", samples)];
    },
};
