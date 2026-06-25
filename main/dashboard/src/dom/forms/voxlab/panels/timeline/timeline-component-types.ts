import { TRANSPORT_ICONS } from "../../../../../shared/constants/voxlab/transport-icons.js";
import type { Timeline } from "../../../../../shared/types/voxlab/timeline-types.js";
import type { Instance } from "../../../../factory/index.js";

export const SCRUB_MAX = 10_000;
export const DRAG_THRESHOLD_PX = 3;
export const MS_PER_SECOND = 1000;
export const PERCENT_SCALE = 100;
export const MIN_DRAG_COMMIT_DELTA_MS = 0.5;
export const READOUT_DECIMALS = 3;

export interface TimelineSource {
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    readonly currentTimeMs: number;
    readonly durationMs: number;
    readonly isPlaying: boolean;
    readonly loop: boolean;
    readonly smoothing: boolean;
    readonly fps: number;
    hasTimeline(): boolean;
    getTimeline(): Timeline | null;
    play(): void;
    pause(): void;
    togglePlay(): void;
    seek(timeMs: number): void;
    stop(): void;
    seekToEnd(): void;
    stepFrame(direction: number): void;
    toggleLoop(): void;
    toggleSmoothing(): void;
    moveKeyframes(fromMs: number, toMs: number): void;
    snapAtCursor(): void;
    deleteNearCursor(): void;
    clearAllKeyframes(): void;
}

export interface TransportButtonSpec {
    icon: string;
    label: string;
    modifier: string;
    onClick: (source: TimelineSource) => void;
}

export const TRANSPORT_BUTTONS: ReadonlyArray<TransportButtonSpec> = [
    { icon: TRANSPORT_ICONS.start, label: "Jump to start", modifier: "start", onClick: (s) => s.seek(0) },
    { icon: TRANSPORT_ICONS.prevFrame, label: "Previous frame", modifier: "prev", onClick: (s) => s.stepFrame(-1) },
    { icon: TRANSPORT_ICONS.play, label: "Play / Pause", modifier: "play", onClick: (s) => s.togglePlay() },
    { icon: TRANSPORT_ICONS.stop, label: "Stop", modifier: "stop", onClick: (s) => s.stop() },
    { icon: TRANSPORT_ICONS.nextFrame, label: "Next frame", modifier: "next", onClick: (s) => s.stepFrame(1) },
    { icon: TRANSPORT_ICONS.end, label: "Jump to end", modifier: "end", onClick: (s) => s.seekToEnd() },
    { icon: TRANSPORT_ICONS.loop, label: "Toggle loop", modifier: "loop", onClick: (s) => s.toggleLoop() },
    {
        icon: TRANSPORT_ICONS.smoothingCurve,
        label: "Toggle smoothing",
        modifier: "smoothing",
        onClick: (s) => s.toggleSmoothing(),
    },
];

export interface MarkerDragContext {
    marker: Instance<HTMLButtonElement>;
    dragState: { startX: number; currentTime: number; dragged: boolean };
    downEvent: PointerEvent;
    originalTime: number;
    durationMs: number;
    railRect: DOMRect;
    frameMs: number;
}
