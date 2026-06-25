import type { WritesStreamEvent } from "../types.js";
import { dispatchProjection, parseRecordHit } from "./stream-mux-records.js";
import { getRecords } from "./stream-mux-state.js";

export function handleMessage(e: MessageEvent<string>): void {
    const hit = parseRecordHit(e, getRecords());
    if (!hit) return;
    const { rec, payload } = hit;
    if (rec.kind === "projection") return dispatchProjection(rec, payload);
    if (rec.kind === "writes") {
        for (const h of rec.handlers) h(payload as WritesStreamEvent);
        return;
    }
    for (const h of rec.handlers) h();
}
