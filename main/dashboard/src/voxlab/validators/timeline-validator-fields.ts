import { SNAPSHOT_SCHEMA_VERSION } from "../../shared/types/voxlab/snapshot-types.js";
import { TIMELINE_SCHEMA_VERSION, type Timeline } from "../../shared/types/voxlab/timeline-types.js";

const MAX_FPS = 120;
const FRAME_BUDGET_BYTES = 500_000_000;
const BYTES_PER_MB = 1_000_000;

export function validateTimelineFields(timeline: Timeline, errors: string[]): void {
    if (timeline.schemaVersion !== TIMELINE_SCHEMA_VERSION) {
        errors.push(`schemaVersion must be ${TIMELINE_SCHEMA_VERSION}, got ${String(timeline.schemaVersion)}`);
    }
    if (!Number.isFinite(timeline.durationMs) || timeline.durationMs <= 0) {
        errors.push(`durationMs must be > 0, got ${timeline.durationMs}`);
    }
    if (!Number.isFinite(timeline.fps) || timeline.fps <= 0) {
        errors.push(`fps must be > 0, got ${timeline.fps}`);
    } else if (timeline.fps > MAX_FPS) {
        errors.push(`fps ${timeline.fps} exceeds maximum ${MAX_FPS}`);
    }
    if (!timeline.initialSnapshot || typeof timeline.initialSnapshot !== "object") {
        errors.push("initialSnapshot is missing");
    } else if (timeline.initialSnapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
        errors.push(
            `initialSnapshot.schemaVersion must be ${SNAPSHOT_SCHEMA_VERSION}, got ${String(timeline.initialSnapshot.schemaVersion)}`,
        );
    }
}

export function pushBudgetWarning(
    timeline: Timeline,
    captureWidth: number,
    captureHeight: number,
    warnings: string[],
): void {
    const frameCount = Math.round((timeline.durationMs / 1000) * timeline.fps);
    const heldBytes = frameCount * captureWidth * captureHeight * 4;
    if (heldBytes > FRAME_BUDGET_BYTES) {
        warnings.push(
            `Naive collection of ${frameCount} ${captureWidth}x${captureHeight} frames would use ${Math.round(heldBytes / BYTES_PER_MB)} MB; streaming bake required (already used).`,
        );
    }
}
