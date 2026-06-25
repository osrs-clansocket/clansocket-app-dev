import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";
import { applyDelta, commitState, freshStoreState, applyBaseline, type LiveStoreState } from "./live-store-delta.js";
import type { LiveRow, LiveStore, LiveStoreConfig } from "./live-store-types.js";
export type { LiveChange, LiveRow, LiveSource, LiveStore, LiveStoreConfig } from "./live-store-types.js";

function makeStoreReader<Row extends LiveRow>(
    state: LiveStoreState<Row>,
): Pick<LiveStore<Row>, "get" | "keys" | "all" | "size" | "revision" | "seq"> {
    return {
        get: (key) => state.byKey.get(key),
        keys: () => state.insertion.values(),
        all: () => {
            const out: Row[] = [];
            for (const key of state.insertion) {
                const row = state.byKey.get(key);
                if (row !== undefined) out.push(row);
            }
            return out;
        },
        size: () => state.byKey.size,
        revision: () => state.rev,
        seq: () => state.lastSeq,
    };
}

function buildStoreLifecycle<Row extends LiveRow>(
    state: LiveStoreState<Row>,
    config: LiveStoreConfig<Row>,
    syncBaseline: (base: SnapshotBaseline) => void,
    ingest: (batch: DeltaBatch) => void,
): { start: () => void; teardown: () => void } {
    return {
        start: () => {
            if (state.started) return;
            state.started = true;
            state.unsub = config.source.subscribe(syncBaseline, ingest);
        },
        teardown: () => {
            state.unsub?.();
            state.unsub = null;
            state.started = false;
            state.listeners.clear();
            state.byKey.clear();
            state.insertion.length = 0;
            state.pendingChanged.clear();
            state.pendingRemoved.clear();
        },
    };
}

function makeAppendRows<Row extends LiveRow>(
    state: LiveStoreState<Row>,
    config: LiveStoreConfig<Row>,
): (rows: Row[]) => void {
    return (rows: Row[]): void => {
        for (const row of rows) {
            const key = config.keyOf(row);
            if (state.byKey.has(key)) continue;
            state.insertion.push(key);
            state.byKey.set(key, row);
            state.pendingChanged.add(key);
        }
        if (!state.hidden) commitState(state, config.maxKeys);
    };
}

function makeOnChange<Row extends LiveRow>(state: LiveStoreState<Row>): LiveStore<Row>["onChange"] {
    return (listener) => {
        state.listeners.add(listener);
        return () => {
            state.listeners.delete(listener);
        };
    };
}

function makeSetHidden<Row extends LiveRow>(
    state: LiveStoreState<Row>,
    config: LiveStoreConfig<Row>,
): (next: boolean) => void {
    return (next) => {
        if (state.hidden === next) return;
        state.hidden = next;
        if (!state.hidden) commitState(state, config.maxKeys);
    };
}

export function createLiveStore<Row extends LiveRow>(config: LiveStoreConfig<Row>): LiveStore<Row> {
    const state = freshStoreState<Row>();
    const ingest = (batch: DeltaBatch): void => {
        for (const d of batch.deltas) applyDelta(state, d);
        if (!state.hidden) commitState(state, config.maxKeys);
    };
    const syncBaseline = (base: SnapshotBaseline): void => applyBaseline(state, base, config.keyOf, config.maxKeys);
    const { start, teardown } = buildStoreLifecycle(state, config, syncBaseline, ingest);
    return {
        ...makeStoreReader(state),
        start,
        teardown,
        appendRows: makeAppendRows(state, config),
        onChange: makeOnChange(state),
        setHidden: makeSetHidden(state, config),
    };
}
