import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { cameraAxisTrack, orbitState } from "../presets-utils.js";

export const push: AnimationPresetDefinition = {
    id: "camera.push",
    name: "Push (zoom in)",
    category: "Camera",
    defaultDurationMs: 1500,
    generate(ctx) {
        const o = orbitState(ctx.snapshot);
        return [
            cameraAxisTrack("X", ctx.durationMs, 4, (u) => o.cx + (o.tx - o.cx) * u * 0.55),
            cameraAxisTrack("Y", ctx.durationMs, 4, (u) => o.cy + (o.ty - o.cy) * u * 0.55),
            cameraAxisTrack("Z", ctx.durationMs, 4, (u) => o.cz + (o.tz - o.cz) * u * 0.55),
        ];
    },
};
