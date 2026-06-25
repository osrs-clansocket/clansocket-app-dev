import type { TrackType } from "./timeline-types.js";

export interface GeneratedKeyframe {
    t: number;
    v: unknown;
}

export interface GeneratedTrack {
    property: string;
    type: TrackType;
    keyframes: GeneratedKeyframe[];
}
