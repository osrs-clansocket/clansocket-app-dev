import type { Timeline } from "../../shared/types/voxlab/timeline-types.js";
import { isObject } from "./timeline-parser-types.js";

function isTrackShape(t: unknown): boolean {
    if (!isObject(t)) return false;
    const trk = t as Record<string, unknown>;
    if (typeof trk.property !== "string" || typeof trk.type !== "string") return false;
    if (!Array.isArray(trk.keyframes)) return false;
    for (const k of trk.keyframes) {
        if (!isObject(k)) return false;
        const kf = k as Record<string, unknown>;
        if (typeof kf.t !== "number" || !("v" in kf)) return false;
    }
    return true;
}

export function isTimelineShape(value: unknown): value is Timeline {
    if (!isObject(value)) return false;
    const v = value as Record<string, unknown>;
    if (
        typeof v.schemaVersion !== "number" ||
        typeof v.durationMs !== "number" ||
        typeof v.fps !== "number" ||
        typeof v.loop !== "boolean"
    )
        return false;
    if (!Array.isArray(v.tracks)) return false;
    if (!isObject(v.initialSnapshot)) return false;
    for (const t of v.tracks) {
        if (!isTrackShape(t)) return false;
    }
    return true;
}
