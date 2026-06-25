import type { SceneSnapshot } from "../../../shared/types/voxlab/snapshot-types.js";

export interface ApplyPresetArgs {
    presetId: string;
    snapshot: SceneSnapshot;
    durationMs: number;
    cursorOffsetMs: number;
    generatedTracks: ReadonlyArray<{
        property: string;
        type: "number" | "color" | "step";
        keyframes: ReadonlyArray<{ t: number; v: unknown }>;
    }>;
}

export interface KeyframeWithPreset {
    t: number;
    v: unknown;
    presetId?: string;
}

export interface TrackLike {
    keyframes: KeyframeWithPreset[];
}
