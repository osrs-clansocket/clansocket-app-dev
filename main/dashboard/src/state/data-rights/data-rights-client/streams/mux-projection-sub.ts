import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";
import { scheduleReopen } from "./stream-mux-connection.js";
import { nextId, getRecords } from "./stream-mux-state.js";

export interface ProjectionSubParams {
    readonly topic: string;
    readonly params: Record<string, string | number | undefined>;
    readonly onSnapshot: (base: SnapshotBaseline) => void;
    readonly onDelta: (batch: DeltaBatch) => void;
}

export function subscribeProjectionMux(sub: ProjectionSubParams): () => void {
    const id = `p-${nextId()}`;
    getRecords().set(id, { id, kind: "projection", ...sub });
    scheduleReopen();
    return () => {
        getRecords().delete(id);
        scheduleReopen();
    };
}
