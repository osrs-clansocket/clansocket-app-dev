import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";

export function collectPresetIds(timeline: Timeline): string[] {
    const ids = new Set<string>();
    for (const track of timeline.tracks) {
        for (const kf of track.keyframes) if (kf.presetId) ids.add(kf.presetId);
    }
    return [...ids];
}
