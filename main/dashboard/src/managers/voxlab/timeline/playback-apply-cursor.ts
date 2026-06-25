import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import { applyByPath } from "../../../voxlab/timeline/property-paths.js";
import type { SnapshotManager } from "../snapshot-manager.js";
import { clampCursor, sampleTrack } from "./timeline-manager-sample.js";
import { buildDraftSnapshot } from "./timeline-manager-tracks.js";
import type { PlaybackState } from "./playback-state.js";

export interface ApplyCursorDeps {
    snapshot: SnapshotManager;
    animatedParts: ReadonlySet<string>;
    emit: <T>(type: string, detail: T) => void;
}

export interface ApplyCursorArgs {
    state: PlaybackState;
    timeline: Timeline;
    timeMs: number;
    rebaseTimebase: boolean;
    deps: ApplyCursorDeps;
}

export function applyCursor(args: ApplyCursorArgs): void {
    const { state, timeline, timeMs, rebaseTimebase, deps } = args;
    const clamped = clampCursor(timeMs, timeline);
    state.cursorMs = clamped;
    if (rebaseTimebase && state.playing) {
        state.playStartMs = performance.now();
        state.playStartCursor = clamped;
    }
    const draft = buildDraftSnapshot(timeline, deps.animatedParts);
    const smoothing = timeline.smoothing;
    for (const track of timeline.tracks) {
        const value = sampleTrack(track, clamped, smoothing);
        if (value !== undefined) applyByPath(draft, track.property, value);
    }
    deps.snapshot.restore(draft, { onlyParts: deps.animatedParts });
    deps.emit("timeline-seek", { timeMs: clamped });
}
