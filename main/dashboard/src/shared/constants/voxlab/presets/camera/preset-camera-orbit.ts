import type { AnimationPresetDefinition, PresetContext } from "../../../../types/voxlab/preset-def-types.js";
import type { GeneratedKeyframe, GeneratedTrack } from "../../../../types/voxlab/preset-track-types.js";
import { cameraAxisTrack, orbitState, track } from "../presets-utils.js";

export const orbitSpin: AnimationPresetDefinition = {
    id: "camera.orbitSpin",
    name: "Orbit Spin",
    category: "Camera",
    defaultDurationMs: 3000,
    description: "Full 360° orbit around the model's pivot.",
    generate(ctx: PresetContext): GeneratedTrack[] {
        const o = orbitState(ctx.snapshot);
        const steps = 16;
        const xs: GeneratedKeyframe[] = [];
        const zs: GeneratedKeyframe[] = [];
        for (let i = 0; i <= steps; i++) {
            const u = i / steps;
            const ang = o.phase0 + u * Math.PI * 2;
            const t = u * ctx.durationMs;
            xs.push({ t, v: o.tx + Math.cos(ang) * o.radius });
            zs.push({ t, v: o.tz + Math.sin(ang) * o.radius });
        }
        return [track("camera.positionX", "number", xs), track("camera.positionZ", "number", zs)];
    },
};

export const halfSpin: AnimationPresetDefinition = {
    id: "camera.halfSpin",
    name: "Half Spin",
    category: "Camera",
    defaultDurationMs: 2000,
    generate(ctx) {
        const o = orbitState(ctx.snapshot);
        return [
            cameraAxisTrack("X", ctx.durationMs, 10, (u) => o.tx + Math.cos(o.phase0 + u * Math.PI) * o.radius),
            cameraAxisTrack("Z", ctx.durationMs, 10, (u) => o.tz + Math.sin(o.phase0 + u * Math.PI) * o.radius),
        ];
    },
};
