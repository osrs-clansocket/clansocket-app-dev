import type { Timeline } from "../../shared/types/voxlab/timeline-types.js";
import type { ValidationResult } from "./timeline-validator-types.js";
import { pushBudgetWarning, validateTimelineFields } from "./timeline-validator-fields.js";
import { validateTrack } from "./timeline-validator-track.js";

export type { ValidationFail, ValidationOk, ValidationResult } from "./timeline-validator-types.js";

export function validateTimeline(timeline: Timeline, captureWidth?: number, captureHeight?: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    validateTimelineFields(timeline, errors);
    for (let i = 0; i < timeline.tracks.length; i++) {
        validateTrack({ timeline, errors, warnings, track: timeline.tracks[i], index: i });
    }
    if (captureWidth !== undefined && captureHeight !== undefined) {
        pushBudgetWarning(timeline, captureWidth, captureHeight, warnings);
    }
    if (errors.length > 0) return { ok: false, errors, warnings };
    return { ok: true, warnings };
}
