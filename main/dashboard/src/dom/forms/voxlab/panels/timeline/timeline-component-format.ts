import type { Timeline } from "../../../../../shared/types/voxlab/timeline-types.js";
import { READOUT_DECIMALS } from "./timeline-component-types.js";

export function formatGroups(timeline: Timeline): Map<number, Array<{ property: string; value: unknown }>> {
    const groups = new Map<number, Array<{ property: string; value: unknown }>>();
    for (const track of timeline.tracks) {
        for (const kf of track.keyframes) {
            const key = Math.round(kf.t);
            let bucket = groups.get(key);
            if (!bucket) {
                bucket = [];
                groups.set(key, bucket);
            }
            bucket.push({ property: track.property, value: kf.v });
        }
    }
    return groups;
}

export function formatValue(value: unknown): string {
    if (typeof value === "number") {
        const s = value.toFixed(READOUT_DECIMALS);
        if (!s.includes(".")) return s;
        let end = s.length;
        while (end > 0 && s.charAt(end - 1) === "0") end--;
        if (end > 0 && s.charAt(end - 1) === ".") end--;
        return s.slice(0, end);
    }
    if (typeof value === "string") return value;
    if (typeof value === "boolean") return value ? "true" : "false";
    return JSON.stringify(value);
}
