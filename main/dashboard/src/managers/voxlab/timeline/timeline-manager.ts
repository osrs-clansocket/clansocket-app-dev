import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { SnapshotRegistry } from "../../../state/voxlab/registries/snapshot-registry.js";
import type { SnapshotManager } from "../snapshot-manager.js";
import { computeAnimatedParts } from "./timeline-manager-tracks.js";
import { applyCursor } from "./playback-apply-cursor.js";
import { pauseOn, playOn } from "./playback-play-pause.js";
import { makeTickFn } from "./playback-tick.js";
import { TimelineEditMixin } from "./timeline-edit-mixin.js";

export interface TimelineManagerDeps {
    snapshot: SnapshotManager;
    registry?: SnapshotRegistry;
}

export class TimelineManager extends TimelineEditMixin {
    constructor(protected readonly deps: TimelineManagerDeps) {
        super();
    }

    load(timeline: Timeline): void {
        this.pause();
        this.timeline = timeline;
        this.state.cursorMs = 0;
        this.animatedParts = computeAnimatedParts(timeline);
        this.seek(0);
        this.boundEmit("timeline-loaded", { durationMs: timeline.durationMs });
    }
    unload(): void {
        this.pause();
        this.timeline = null;
        this.state.cursorMs = 0;
        this.boundEmit("timeline-unloaded", undefined);
    }

    stop(): void {
        this.pause();
        this.seek(0);
    }
    seekToEnd(): void {
        if (this.timeline) this.seek(this.timeline.durationMs);
    }
    stepFrame(direction: number): void {
        if (!this.timeline) return;
        if (this.state.playing) this.pause();
        const frameMs = 1000 / Math.max(1, this.timeline.fps);
        this.seek(this.state.cursorMs + direction * frameMs);
    }
    seek(timeMs: number): void {
        this.applyCursorAt(timeMs, true);
    }

    play(): void {
        playOn({ state: this.state, getTimeline: () => this.timeline, tick: this.tick, emit: this.boundEmit });
    }
    pause(): void {
        pauseOn({ state: this.state, emit: this.boundEmit });
    }
    togglePlay(): void {
        if (this.state.playing) this.pause();
        else this.play();
    }

    protected applyCursorAt(timeMs: number, rebase: boolean): void {
        if (!this.timeline) return;
        applyCursor({
            timeMs,
            state: this.state,
            timeline: this.timeline,
            rebaseTimebase: rebase,
            deps: { snapshot: this.deps.snapshot, animatedParts: this.animatedParts, emit: this.boundEmit },
        });
    }

    private tick = makeTickFn({
        state: this.state,
        getTimeline: () => this.timeline,
        apply: (raw, rebase) => this.applyCursorAt(raw, rebase),
        pause: () => this.pause(),
    });
}
