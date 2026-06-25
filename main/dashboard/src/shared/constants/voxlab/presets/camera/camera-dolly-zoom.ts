import type { AnimationPresetDefinition } from "../../../../types/voxlab/preset-def-types.js";
import { cameraAxisTrack, numberTrack, readNumber } from "../presets-utils.js";

export const dollyZoom: AnimationPresetDefinition = {
    id: "camera.dollyZoom",
    name: "Dolly Zoom",
    category: "Camera",
    defaultDurationMs: 2000,
    description: "Push in while FOV widens — vertigo.",
    generate(ctx) {
        const cz = readNumber(ctx.snapshot, "camera", "positionZ", 1.6);
        const fov = readNumber(ctx.snapshot, "camera", "fov", 45);
        return [
            cameraAxisTrack("Z", ctx.durationMs, 8, (u) => cz * (1 - 0.4 * u)),
            numberTrack("camera.fov", ctx.durationMs, 8, (u) => fov * (1 + 0.6 * u)),
        ];
    },
};
