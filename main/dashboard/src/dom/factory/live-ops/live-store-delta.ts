import type { RowDelta } from "@clansocket/realtime";
import type { LiveChange, LiveRow } from "./live-store-types.js";

export interface LiveStoreState<Row> {
    byKey: Map<string, Row>;
    insertion: string[];
    listeners: Set<(c: LiveChange) => void>;
    pendingChanged: Set<string>;
    pendingRemoved: Set<string>;
    rev: number;
    lastSeq: number;
    started: boolean;
    hidden: boolean;
    unsub: (() => void) | null;
}

export function freshStoreState<Row extends LiveRow>(): LiveStoreState<Row> {
    return {
        byKey: new Map(),
        insertion: [],
        listeners: new Set(),
        pendingChanged: new Set(),
        pendingRemoved: new Set(),
        rev: 0,
        lastSeq: 0,
        started: false,
        hidden: false,
        unsub: null,
    };
}

function evictLiveStore<Row>(state: LiveStoreState<Row>, cap: number | undefined): void {
    if (cap === undefined) return;
    while (state.byKey.size > cap && state.insertion.length > 0) {
        const oldest = state.insertion.pop();
        if (oldest !== undefined && state.byKey.delete(oldest)) state.pendingRemoved.add(oldest);
    }
}

export function applyDelta<Row>(state: LiveStoreState<Row>, d: RowDelta): void {
    if (d.seq <= state.lastSeq) return;
    state.lastSeq = d.seq;
    if (d.op === "remove") {
        if (state.byKey.delete(d.key)) {
            const at = state.insertion.indexOf(d.key);
            if (at >= 0) state.insertion.splice(at, 1);
            state.pendingRemoved.add(d.key);
            state.pendingChanged.delete(d.key);
        }
        return;
    }
    if (d.row === null) return;
    if (!state.byKey.has(d.key)) state.insertion.unshift(d.key);
    state.byKey.set(d.key, d.row as Row);
    state.pendingChanged.add(d.key);
    state.pendingRemoved.delete(d.key);
}

export function commitState<Row>(state: LiveStoreState<Row>, cap: number | undefined): void {
    if (state.pendingChanged.size === 0 && state.pendingRemoved.size === 0) return;
    evictLiveStore(state, cap);
    state.rev++;
    const change: LiveChange = {
        changed: new Set(state.pendingChanged),
        removed: new Set(state.pendingRemoved),
        revision: state.rev,
    };
    state.pendingChanged.clear();
    state.pendingRemoved.clear();
    for (const fn of [...state.listeners]) fn(change);
}
