import type { PresenceTemplate } from "../../shared/types/presence-types.js";

export function buildActivityTimestamps(t: PresenceTemplate): Record<string, unknown> | null {
    if (!t.activity_timestamp_start_at && !t.activity_timestamp_end_at) return null;
    const ts: Record<string, unknown> = {};
    if (t.activity_timestamp_start_at) ts.start = t.activity_timestamp_start_at;
    if (t.activity_timestamp_end_at) ts.end = t.activity_timestamp_end_at;
    return ts;
}
