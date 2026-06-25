import type { Timeline, Track } from "../../../shared/types/voxlab/timeline-types.js";
import { applyEase } from "../../../voxlab/timeline/easings.js";
import { interpolate, smoothInterpolate } from "../../../voxlab/timeline/interpolators.js";

export const DEFAULT_FPS = 30;
export const KEYFRAME_SNAP_EPSILON_MS = 0.5;

export function clampCursor(timeMs: number, timeline: Timeline): number {
    if (timeline.durationMs <= 0) return 0;
    if (timeline.loop) {
        const m = timeMs % timeline.durationMs;
        return m < 0 ? m + timeline.durationMs : m;
    }
    if (timeMs < 0) return 0;
    if (timeMs > timeline.durationMs) return timeline.durationMs;
    return timeMs;
}

function interpolateKeyframes(track: Track, i: number, timeMs: number, smoothing: boolean): unknown {
    const kfs = track.keyframes;
    const a = kfs[i];
    const b = kfs[i + 1];
    if (b.t === a.t) return b.v;
    const rawAlpha = (timeMs - a.t) / (b.t - a.t);
    const easedAlpha = applyEase(b.ease, rawAlpha);
    if (!smoothing) {
        return interpolate({ type: track.type, interpName: b.interp, a: a.v, b: b.v, t: easedAlpha });
    }
    const p0 = i > 0 ? kfs[i - 1].v : a.v;
    const p3 = i + 2 < kfs.length ? kfs[i + 2].v : b.v;
    return smoothInterpolate({ p0, p3, type: track.type, interpName: b.interp, p1: a.v, p2: b.v, t: easedAlpha });
}

export function sampleTrack(track: Track, timeMs: number, smoothing: boolean): unknown {
    const kfs = track.keyframes;
    if (kfs.length === 0) return undefined;
    if (timeMs <= kfs[0].t) return kfs[0].v;
    if (timeMs >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].v;
    let i = 0;
    for (; i < kfs.length - 1; i++) {
        if (timeMs <= kfs[i + 1].t) break;
    }
    return interpolateKeyframes(track, i, timeMs, smoothing);
}
