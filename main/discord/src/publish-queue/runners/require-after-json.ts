import type { PendingPublishRow } from "../../loaders/publish-queue-loader.js";

export function requireAfterJson<T>(row: PendingPublishRow, op: string): T {
    if (!row.after_json) throw new Error(`${op} requires after_json`);
    return JSON.parse(row.after_json) as T;
}
