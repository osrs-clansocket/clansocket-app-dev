import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { SceneSnapshot } from "../../../shared/types/voxlab/snapshot-types.js";
import { getPathDescriptor } from "../../../voxlab/timeline/property-paths.js";
import { upsertKeyframe, upsertSimpleKeyframe } from "./timeline-track-upsert.js";

export function applyTrackKeyframes(
    timeline: Timeline,
    args: {
        gen: {
            property: string;
            type: "number" | "color" | "step";
            keyframes: ReadonlyArray<{ t: number; v: unknown }>;
        };
        presetId: string;
        cursorOffsetMs: number;
        epsilon: number;
    },
): void {
    const { gen, presetId, cursorOffsetMs, epsilon } = args;
    let track = timeline.tracks.find((t) => t.property === gen.property);
    if (!track) {
        track = { property: gen.property, type: gen.type, keyframes: [] };
        timeline.tracks.push(track);
    }
    const timelineDuration = timeline.durationMs;
    for (const kf of gen.keyframes) {
        const tAbs = Math.max(0, Math.min(timelineDuration, kf.t + cursorOffsetMs));
        upsertKeyframe({ track, tAbs, presetId, epsilon, value: kf.v });
    }
}

export function snapPath(timeline: Timeline, path: string, snap: SceneSnapshot, time: number): void {
    const descriptor = getPathDescriptor(path);
    if (!descriptor) return;
    const value = descriptor.read(snap);
    if (value === undefined) return;
    let track = timeline.tracks.find((t) => t.property === path);
    if (!track) {
        track = { property: path, type: descriptor.type, keyframes: [] };
        timeline.tracks.push(track);
    }
    upsertSimpleKeyframe(track, time, value);
}
