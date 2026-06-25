import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import { collectPresetIds } from "./timeline-manager-tracks.js";
import { DEFAULT_FPS } from "./timeline-manager-sample.js";
import { newPlaybackState, type PlaybackState } from "./playback-state.js";

export abstract class TimelineQueryMixin extends EventTarget {
    protected timeline: Timeline | null = null;
    protected animatedParts: Set<string> = new Set();
    protected readonly state: PlaybackState = newPlaybackState();

    hasTimeline(): boolean {
        return this.timeline !== null;
    }
    get durationMs(): number {
        return this.timeline?.durationMs ?? 0;
    }
    get currentTimeMs(): number {
        return this.state.cursorMs;
    }
    get isPlaying(): boolean {
        return this.state.playing;
    }
    getTimeline(): Timeline | null {
        return this.timeline;
    }
    get loop(): boolean {
        return this.timeline?.loop ?? false;
    }
    get smoothing(): boolean {
        return this.timeline?.smoothing ?? true;
    }
    get fps(): number {
        return this.timeline?.fps ?? DEFAULT_FPS;
    }
    activeIds(): string[] {
        return this.timeline ? collectPresetIds(this.timeline) : [];
    }

    protected boundEmit = <T>(type: string, detail: T): void => {
        this.dispatchEvent(new CustomEvent<T>(type, { detail }));
    };
}
