import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { TrackLike } from "./timeline-track-types.js";

function moveTrackKeyframes(track: TrackLike, fromMs: number, clampedTo: number, epsilon: number): boolean {
    const movingIdx: number[] = [];
    for (let i = 0; i < track.keyframes.length; i++)
        if (Math.abs(track.keyframes[i].t - fromMs) < epsilon) movingIdx.push(i);
    if (movingIdx.length === 0) return false;
    track.keyframes = track.keyframes.filter((k, i) => movingIdx.includes(i) || Math.abs(k.t - clampedTo) >= epsilon);
    for (const kf of track.keyframes) if (Math.abs(kf.t - fromMs) < epsilon) kf.t = clampedTo;
    track.keyframes.sort((a, b) => a.t - b.t);
    return true;
}

export function moveAllKeyframes(timeline: Timeline, fromMs: number, clampedTo: number, epsilon: number): boolean {
    let anyMoved = false;
    for (const track of timeline.tracks) {
        if (moveTrackKeyframes(track, fromMs, clampedTo, epsilon)) anyMoved = true;
    }
    return anyMoved;
}
