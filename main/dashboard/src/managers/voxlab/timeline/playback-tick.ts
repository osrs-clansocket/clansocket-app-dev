import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { PlaybackState } from "./playback-state.js";

export function makeTickFn(args: {
    state: PlaybackState;
    getTimeline: () => Timeline | null;
    apply: (raw: number, rebase: boolean) => void;
    pause: () => void;
}): (now: number) => void {
    const tick = (now: number): void => {
        const tl = args.getTimeline();
        if (!args.state.playing || !tl) return;
        const elapsed = now - args.state.playStartMs;
        const raw = args.state.playStartCursor + elapsed;
        args.apply(raw, false);
        if (raw >= tl.durationMs && !tl.loop) {
            args.pause();
            return;
        }
        args.state.rafHandle = requestAnimationFrame(tick);
    };
    return tick;
}
