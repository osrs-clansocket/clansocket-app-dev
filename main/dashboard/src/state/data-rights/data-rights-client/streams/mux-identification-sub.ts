import type { IdentificationRecord } from "./stream-mux-records.js";
import { scheduleReopen } from "./stream-mux-connection.js";
import { getIdentId, nextId, getRecords, setIdentId } from "./stream-mux-state.js";

export function subscribeIdentificationMux(handler: () => void): () => void {
    let rec: IdentificationRecord;
    const existing = getIdentId();
    if (existing === null) {
        const id = `i-${nextId()}`;
        rec = { id, kind: "identification", handlers: new Set() };
        getRecords().set(id, rec);
        setIdentId(id);
        scheduleReopen();
    } else {
        rec = getRecords().get(existing) as IdentificationRecord;
    }
    rec.handlers.add(handler);
    return () => {
        rec.handlers.delete(handler);
        if (rec.handlers.size === 0) {
            getRecords().delete(rec.id);
            setIdentId(null);
            scheduleReopen();
        }
    };
}
