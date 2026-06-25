import type { WritesStreamEvent } from "../types.js";
import type { WritesRecord } from "./stream-mux-records.js";
import { scheduleReopen } from "./stream-mux-connection.js";
import { getWritesId, nextId, getRecords, setWritesId } from "./stream-mux-state.js";

export function subscribeWritesMux(handler: (event: WritesStreamEvent) => void): () => void {
    let rec: WritesRecord;
    const existing = getWritesId();
    if (existing === null) {
        const id = `w-${nextId()}`;
        rec = { id, kind: "writes", handlers: new Set() };
        getRecords().set(id, rec);
        setWritesId(id);
        scheduleReopen();
    } else {
        rec = getRecords().get(existing) as WritesRecord;
    }
    rec.handlers.add(handler);
    return () => {
        rec.handlers.delete(handler);
        if (rec.handlers.size === 0) {
            getRecords().delete(rec.id);
            setWritesId(null);
            scheduleReopen();
        }
    };
}
