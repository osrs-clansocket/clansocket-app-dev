import type { SnapshotBaseline } from "@clansocket/realtime";
import type { LiveRow } from "./live-store-types.js";
import { commitState, type LiveStoreState } from "./live-store-delta.js";

function dropMissingKeys<Row extends LiveRow>(state: LiveStoreState<Row>, next: Set<string>): void {
    for (const key of [...state.insertion]) {
        if (!next.has(key)) {
            state.byKey.delete(key);
            state.pendingRemoved.add(key);
        }
    }
}

export function applyBaseline<Row extends LiveRow>(
    state: LiveStoreState<Row>,
    base: SnapshotBaseline,
    keyOf: (r: Row) => string,
    cap: number | undefined,
): void {
    const next = new Set<string>();
    const order: string[] = [];
    for (const row of base.rows as Row[]) {
        const key = keyOf(row);
        next.add(key);
        order.push(key);
        state.byKey.set(key, row);
        state.pendingChanged.add(key);
    }
    dropMissingKeys(state, next);
    state.insertion.length = 0;
    for (const k of order) state.insertion.push(k);
    state.lastSeq = base.seq;
    if (!state.hidden) commitState(state, cap);
}
