import type { AnimationPresetDefinition } from "../../../types/voxlab/preset-def-types.js";
import { halfSpin, orbitSpin } from "./camera/preset-camera-orbit.js";
import { dollyZoom, pull, push } from "./camera/preset-camera-zoom.js";
import { slowPan, tiltSway } from "./camera/preset-camera-sway.js";

export const CAMERA_PRESETS: ReadonlyArray<AnimationPresetDefinition> = [
    orbitSpin,
    halfSpin,
    push,
    pull,
    dollyZoom,
    slowPan,
    tiltSway,
];
