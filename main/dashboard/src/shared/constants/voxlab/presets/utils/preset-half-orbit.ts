import type { GeneratedTrack } from "../../../../types/voxlab/preset-track-types.js";
import type { OrbitState } from "./preset-orbit-state.js";
import { sample, track } from "./preset-sample.js";

export function halfOrbitTracks(durationMs: number, o: OrbitState, steps: number): GeneratedTrack[] {
    return [
        track(
            "camera.positionX",
            "number",
            sample(durationMs, steps, (u) => o.tx + Math.cos(o.phase0 + u * Math.PI) * o.radius),
        ),
        track(
            "camera.positionZ",
            "number",
            sample(durationMs, steps, (u) => o.tz + Math.sin(o.phase0 + u * Math.PI) * o.radius),
        ),
    ];
}
