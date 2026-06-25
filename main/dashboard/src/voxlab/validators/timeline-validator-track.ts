import type { Timeline, Track } from "../../shared/types/voxlab/timeline-types.js";
import { getPathDescriptor } from "../timeline/property-paths.js";
import { checkValueType, valuesMatch } from "./timeline-value-validator.js";

interface CheckKeyframesArgs {
    label: string;
    track: Track;
    descriptor: { type: string };
    durationMs: number;
    errors: string[];
}

function checkKeyframes(a: CheckKeyframesArgs): void {
    const { label, track, descriptor, durationMs, errors } = a;
    let prevT = -Infinity;
    for (let i = 0; i < track.keyframes.length; i++) {
        const k = track.keyframes[i];
        if (!Number.isFinite(k.t) || k.t < 0 || k.t > durationMs) {
            errors.push(`${label}: keyframe ${i} t=${k.t} out of range [0, ${durationMs}]`);
        }
        if (k.t <= prevT) errors.push(`${label}: keyframes not strictly monotonic (kf ${i} t=${k.t} <= prev=${prevT})`);
        prevT = k.t;
        const valueError = checkValueType(descriptor.type, k.v);
        if (valueError) errors.push(`${label}: keyframe ${i} ${valueError}`);
    }
}

interface ValidateTrackArgs {
    timeline: Timeline;
    track: Track;
    index: number;
    errors: string[];
    warnings: string[];
}

function checkLoopBoundary(label: string, track: Track, descriptor: { type: string }, warnings: string[]): void {
    if (track.keyframes.length < 2) return;
    const first = track.keyframes[0];
    const last = track.keyframes[track.keyframes.length - 1];
    if (!valuesMatch(descriptor.type, first.v, last.v)) {
        warnings.push(
            `${label}: loop=true but first and last keyframe values differ; tween will jump at loop boundary`,
        );
    }
}

export function validateTrack(a: ValidateTrackArgs): void {
    const { timeline, track, index, errors, warnings } = a;
    const label = `tracks[${index}] "${track.property}"`;
    const descriptor = getPathDescriptor(track.property);
    if (!descriptor) {
        errors.push(`${label}: property is not in the allowed path list`);
        return;
    }
    if (track.type !== descriptor.type) {
        errors.push(`${label}: declared type "${track.type}" does not match registered type "${descriptor.type}"`);
    }
    if (track.keyframes.length === 0) {
        errors.push(`${label}: keyframes array is empty`);
        return;
    }
    checkKeyframes({ label, track, descriptor, errors, durationMs: timeline.durationMs });
    if (timeline.loop) checkLoopBoundary(label, track, descriptor, warnings);
}
