import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { readNumber, sample, track } from "../presets-utils.js";

export const tripleLightCycle: AnimationPresetDefinition = {
    id: "lighting.tripleLightCycle",
    name: "Triple-Light Cycle",
    category: "Lighting",
    defaultDurationMs: 3000,
    description: "Key / Fill / Rim swap dominant in sequence.",
    generate(ctx) {
        const ki = readNumber(ctx.snapshot, "keyLight", "keyIntensity", 1.1);
        const fi = readNumber(ctx.snapshot, "fillLight", "fillIntensity", 0.4);
        const ri = readNumber(ctx.snapshot, "rimLight", "intensity", 0.8);
        const wave = (u: number, phase: number): number => 0.3 + Math.max(0, Math.sin(u * Math.PI * 2 - phase)) * 1.0;
        return [
            track(
                "keyLight.keyIntensity",
                "number",
                sample(ctx.durationMs, 16, (u) => ki * wave(u, 0)),
            ),
            track(
                "fillLight.fillIntensity",
                "number",
                sample(ctx.durationMs, 16, (u) => fi * wave(u, (Math.PI * 2) / 3)),
            ),
            track(
                "rimLight.intensity",
                "number",
                sample(ctx.durationMs, 16, (u) => ri * wave(u, (Math.PI * 4) / 3)),
            ),
        ];
    },
};
