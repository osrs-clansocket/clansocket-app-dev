import { TIMELINE_SCHEMA_VERSION, type Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { SnapshotManager } from "../snapshot-manager.js";

export function buildStubTimeline(snapshot: SnapshotManager): Timeline {
    return {
        schemaVersion: TIMELINE_SCHEMA_VERSION,
        durationMs: 2000,
        loop: false,
        fps: 30,
        smoothing: true,
        initialSnapshot: snapshot.capture(),
        tracks: [],
    };
}
