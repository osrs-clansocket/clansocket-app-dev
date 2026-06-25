import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";

export function removePresetTrack(timeline: Timeline, presetId: string): void {
    const next: typeof timeline.tracks = [];
    for (const track of timeline.tracks) {
        const filtered = track.keyframes.filter((k) => k.presetId !== presetId);
        if (filtered.length > 0) next.push({ ...track, keyframes: filtered });
    }
    timeline.tracks = next;
}

export function deletePresetKeyframes(timeline: Timeline, time: number, tolerance: number): boolean {
    const next: typeof timeline.tracks = [];
    let removed = false;
    for (const track of timeline.tracks) {
        const filtered = track.keyframes.filter((k) => Math.abs(k.t - time) >= tolerance);
        if (filtered.length !== track.keyframes.length) removed = true;
        if (filtered.length > 0) next.push({ ...track, keyframes: filtered });
    }
    if (!removed) return false;
    timeline.tracks = next;
    return true;
}
