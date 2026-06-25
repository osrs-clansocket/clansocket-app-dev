import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";

export type LiveRow = Record<string, unknown>;

export interface LiveSource {
    subscribe(onSnapshot: (base: SnapshotBaseline) => void, onDelta: (batch: DeltaBatch) => void): () => void;
}

export interface LiveStoreConfig<Row extends LiveRow> {
    topic: string;
    keyOf: (row: Row) => string;
    source: LiveSource;
    maxKeys?: number;
}

export interface LiveChange {
    changed: ReadonlySet<string>;
    removed: ReadonlySet<string>;
    revision: number;
}

export interface LiveStore<Row extends LiveRow> {
    start(): void;
    teardown(): void;
    get(key: string): Row | undefined;
    keys(): IterableIterator<string>;
    all(): Row[];
    appendRows(rows: Row[]): void;
    size(): number;
    revision(): number;
    seq(): number;
    onChange(listener: (change: LiveChange) => void): () => void;
    setHidden(hidden: boolean): void;
}
