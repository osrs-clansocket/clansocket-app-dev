import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { cameraAxisTrack, orbitState } from "../presets-utils.js";

export const pull: AnimationPresetDefinition = {
    id: "camera.pull",
    name: "Pull (zoom out)",
    category: "Camera",
    defaultDurationMs: 1500,
    generate(ctx) {
        const o = orbitState(ctx.snapshot);
        return [
            cameraAxisTrack("X", ctx.durationMs, 4, (u) => o.cx + (o.cx - o.tx) * u * 0.8),
            cameraAxisTrack("Y", ctx.durationMs, 4, (u) => o.cy + (o.cy - o.ty) * u * 0.4),
            cameraAxisTrack("Z", ctx.durationMs, 4, (u) => o.cz + (o.cz - o.tz) * u * 0.8),
        ];
    },
};
