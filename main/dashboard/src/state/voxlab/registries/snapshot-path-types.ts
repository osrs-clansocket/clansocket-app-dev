import type { TrackType } from "../../../shared/types/voxlab/timeline-types.js";

export interface PathSpec {
    suffix: string;
    type: TrackType;
    read: (state: unknown) => unknown;
    write: (state: unknown, value: unknown) => void;
}

export interface SnapshotPart<TState = unknown> {
    name: string;
    getState: () => TState;
    applyState: (state: TState, opts?: { silent?: boolean }) => void;
    paths: ReadonlyArray<PathSpec>;
}
