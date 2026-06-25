import type { Timeline } from "../../shared/types/voxlab/timeline-types.js";

export interface ParsedTimeline {
    data: Timeline;
    fileSize: number;
}

export function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
