import type { SnapshotBaseline } from "@clansocket/realtime";
import type { TopicState } from "./projection-types.js";

export function seedBaseline(state: TopicState): SnapshotBaseline {
    const rows = state.def.query();
    const baselineRows: Record<string, unknown>[] = [];
    for (const row of rows) {
        state.snapshot[state.def.keyOf(row)] = JSON.stringify(row);
        baselineRows.push(row);
    }
    return { topic: state.topic, seq: state.seq, rows: baselineRows };
}
