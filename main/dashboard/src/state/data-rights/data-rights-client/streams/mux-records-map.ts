import type { MuxRecord } from "./stream-mux-records.js";

const _records = new Map<string, MuxRecord>();

export function getRecords(): Map<string, MuxRecord> {
    return _records;
}
