import { snapshotRegistry, type SnapshotRegistry } from "../../../state/voxlab/registries/snapshot-registry.js";
import { getPathDescriptor } from "../../../voxlab/timeline/property-paths.js";
import type { SnapshotManager } from "../snapshot-manager.js";
import { clampCursor, KEYFRAME_SNAP_EPSILON_MS } from "./timeline-manager-sample.js";
import {
    applyTrackKeyframes,
    computeAnimatedParts,
    deletePresetKeyframes,
    moveAllKeyframes,
    removePresetTrack,
    snapPath,
    upsertSimpleKeyframe,
    type ApplyPresetArgs,
} from "./timeline-manager-tracks.js";
import { TimelineQueryMixin } from "./timeline-query-mixin.js";

export abstract class TimelineEditMixin extends TimelineQueryMixin {
    protected abstract readonly deps: { snapshot: SnapshotManager; registry?: SnapshotRegistry };
    protected abstract applyCursorAt(timeMs: number, rebase: boolean): void;

    setSmoothing(value: boolean): void {
        if (!this.timeline || this.timeline.smoothing === value) return;
        this.timeline.smoothing = value;
        this.boundEmit("timeline-smoothing-changed", { smoothing: value });
        this.refresh();
    }
    toggleSmoothing(): void {
        this.setSmoothing(!this.smoothing);
    }
    setLoop(loop: boolean): void {
        if (!this.timeline || this.timeline.loop === loop) return;
        this.timeline.loop = loop;
        this.boundEmit("timeline-loop-changed", { loop });
    }
    toggleLoop(): void {
        this.setLoop(!this.loop);
    }

    applyPresetKeyframes(args: ApplyPresetArgs): void {
        if (!this.timeline) return;
        for (const gen of args.generatedTracks) {
            applyTrackKeyframes(this.timeline, {
                gen,
                presetId: args.presetId,
                cursorOffsetMs: args.cursorOffsetMs,
                epsilon: KEYFRAME_SNAP_EPSILON_MS,
            });
        }
        this.tracksChanged(null);
    }
    removePresetKeyframes(presetId: string): void {
        if (!this.timeline) return;
        removePresetTrack(this.timeline, presetId);
        this.tracksChanged(null);
    }

    snapAtCursor(): void {
        if (!this.timeline) return;
        const snap = this.deps.snapshot.capture();
        const tl = this.timeline;
        for (const path of (this.deps.registry ?? snapshotRegistry).allPathStrings())
            snapPath(tl, path, snap, this.state.cursorMs);
        this.animatedParts = computeAnimatedParts(tl);
        this.boundEmit("timeline-tracks-changed", { trackCount: tl.tracks.length, property: null });
    }

    deleteNearCursor(): void {
        if (!this.timeline) return;
        const tolerance = (1000 / Math.max(1, this.timeline.fps)) * 0.5;
        if (!deletePresetKeyframes(this.timeline, this.state.cursorMs, tolerance)) return;
        this.tracksChanged(null);
    }

    clearAllKeyframes(): void {
        if (!this.timeline) return;
        this.timeline.tracks = [];
        this.tracksChanged(null);
    }

    moveKeyframes(fromMs: number, toMs: number): void {
        if (!this.timeline) return;
        const epsilon = 0.5;
        const clampedTo = clampCursor(toMs, this.timeline);
        if (Math.abs(clampedTo - fromMs) < epsilon) return;
        if (moveAllKeyframes(this.timeline, fromMs, clampedTo, epsilon)) this.tracksChanged(null);
    }

    setKeyframe(propertyPath: string, timeMs: number, value: unknown): void {
        if (!this.timeline) return;
        const descriptor = getPathDescriptor(propertyPath);
        if (!descriptor) return;
        let track = this.timeline.tracks.find((t) => t.property === propertyPath);
        if (!track) {
            track = { property: propertyPath, type: descriptor.type, keyframes: [] };
            this.timeline.tracks.push(track);
        }
        upsertSimpleKeyframe(track, timeMs, value);
        this.animatedParts = computeAnimatedParts(this.timeline);
        this.boundEmit("timeline-tracks-changed", { trackCount: this.timeline.tracks.length, property: propertyPath });
    }

    protected tracksChanged(property: string | null): void {
        if (!this.timeline) return;
        this.animatedParts = computeAnimatedParts(this.timeline);
        this.boundEmit("timeline-tracks-changed", { trackCount: this.timeline.tracks.length, property });
        this.refresh();
    }
    protected refresh(): void {
        this.applyCursorAt(this.state.cursorMs, false);
    }
}
