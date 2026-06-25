import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { cameraAxisTrack, numberTrack, readNumber } from "../presets-utils.js";

export const slowPan: AnimationPresetDefinition = {
    id: "camera.slowPan",
    name: "Slow Pan",
    category: "Camera",
    defaultDurationMs: 4000,
    generate(ctx) {
        const tx = readNumber(ctx.snapshot, "camera", "targetX", 0);
        return [numberTrack("camera.targetX", ctx.durationMs, 6, (u) => tx + Math.sin(u * Math.PI * 2) * 0.6)];
    },
};

export const tiltSway: AnimationPresetDefinition = {
    id: "camera.tiltSway",
    name: "Tilt Sway",
    category: "Camera",
    defaultDurationMs: 3000,
    generate(ctx) {
        const cy = readNumber(ctx.snapshot, "camera", "positionY", 0.9);
        return [cameraAxisTrack("Y", ctx.durationMs, 8, (u) => cy + Math.sin(u * Math.PI * 2) * 0.35)];
    },
};
