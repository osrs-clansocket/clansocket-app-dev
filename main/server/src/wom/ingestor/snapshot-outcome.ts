import type { SnapshotPlanResult } from "./snapshot-plan-types.js";

export type SnapshotOutcome = "enqueued" | "skipped_fresh" | "failed";

export const SNAPSHOT_COUNTERS: Record<SnapshotOutcome, keyof SnapshotPlanResult | null> = {
    enqueued: "snapshotsEnqueued",
    skipped_fresh: "snapshotsSkippedFresh",
    failed: null,
};
