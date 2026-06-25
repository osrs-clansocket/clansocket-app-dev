import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { PlaybackState } from "./playback-state.js";

export interface PlayCtx {
    state: PlaybackState;
    getTimeline: () => Timeline | null;
    tick: (now: number) => void;
    emit: <T>(type: string, detail: T) => void;
}

export function playOn(ctx: PlayCtx): void {
    const tl = ctx.getTimeline();
    if (!tl || ctx.state.playing) return;
    if (ctx.state.cursorMs >= tl.durationMs && !tl.loop) ctx.state.cursorMs = 0;
    ctx.state.playing = true;
    ctx.state.playStartMs = performance.now();
    ctx.state.playStartCursor = ctx.state.cursorMs;
    ctx.state.rafHandle = requestAnimationFrame(ctx.tick);
    ctx.emit("timeline-play", undefined);
}

export function pauseOn(ctx: { state: PlaybackState; emit: <T>(type: string, detail: T) => void }): void {
    const wasPlaying = ctx.state.playing;
    ctx.state.playing = false;
    if (ctx.state.rafHandle) {
        cancelAnimationFrame(ctx.state.rafHandle);
        ctx.state.rafHandle = 0;
    }
    if (wasPlaying) ctx.emit("timeline-pause", undefined);
}
