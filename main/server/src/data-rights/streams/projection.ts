import type { DeltaBatch, RowDelta, SnapshotBaseline } from "@clansocket/realtime";
import { registerWriteListener } from "./writes-stream.js";

export interface ProjectionTrigger {
    scopeKey: string;
    table: string;
}

export interface ProjectionTopic {
    triggers: ReadonlyArray<ProjectionTrigger>;
    query(): Record<string, unknown>[];
    keyOf(row: Record<string, unknown>): string;
}

export function defineTopic(spec: ProjectionTopic): ProjectionTopic {
    return spec;
}

export interface ProjectionHandle {
    baseline: SnapshotBaseline;
    unsubscribe(): void;
}

interface TopicState {
    topic: string;
    def: ProjectionTopic;
    snapshot: Record<string, string>;
    seq: number;
    sink: (batch: DeltaBatch) => void;
}

const states = new Set<TopicState>();
const dirty = new Set<TopicState>();
let flushScheduled = false;

function recompute(state: TopicState): void {
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

function flushDirty(): void {
    flushScheduled = false;
    const batch = [...dirty];
    dirty.clear();
    for (const state of batch) recompute(state);
}

function triggered(state: TopicState, scopeKey: string, table: string): boolean {
    for (const t of state.def.triggers) {
        if (t.scopeKey === scopeKey && t.table === table) return true;
    }
    return false;
}

function markDirty(scopeKey: string, table: string): void {
    let matched = false;
    for (const state of states) {
        if (triggered(state, scopeKey, table)) {
            dirty.add(state);
            matched = true;
        }
    }
    if (matched && !flushScheduled) {
        flushScheduled = true;
        setImmediate(flushDirty);
    }
}

registerWriteListener((event) => markDirty(event.scopeKey, event.table));

function seedBaseline(state: TopicState): SnapshotBaseline {
    const rows = state.def.query();
    const baselineRows: Record<string, unknown>[] = [];
    for (const row of rows) {
        state.snapshot[state.def.keyOf(row)] = JSON.stringify(row);
        baselineRows.push(row);
    }
    return { topic: state.topic, seq: state.seq, rows: baselineRows };
}

export function subscribeProjection(
    topic: string,
    def: ProjectionTopic,
    sink: (batch: DeltaBatch) => void,
): ProjectionHandle {
    const state: TopicState = { topic, def, sink, snapshot: {}, seq: 0 };
    states.add(state);
    return {
        baseline: seedBaseline(state),
        unsubscribe(): void {
            states.delete(state);
            dirty.delete(state);
        },
    };
}
