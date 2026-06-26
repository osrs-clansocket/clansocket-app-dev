import type { RowDelta } from "@clansocket/realtime";
import type { TopicState } from "./projection-types.js";

export function recompute(state: TopicState): void {
    const rows = state.def.query();
    const fromSeq = state.seq;
    const next: Record<string, string> = {};
    const deltas: RowDelta[] = [];
    for (const row of rows) {
        const key = state.def.keyOf(row);
        const hash = JSON.stringify(row);
        next[key] = hash;
        if (state.snapshot[key] !== hash) {
            state.seq += 1;
            deltas.push({ key, row, topic: state.topic, seq: state.seq, op: "upsert" });
        }
    }
    for (const key of Object.keys(state.snapshot)) {
        if (key in next) continue;
        state.seq += 1;
        deltas.push({ key, topic: state.topic, seq: state.seq, op: "remove", row: null });
    }
    state.snapshot = next;
    if (deltas.length > 0) state.sink({ deltas, fromSeq, topic: state.topic, toSeq: state.seq });
}
