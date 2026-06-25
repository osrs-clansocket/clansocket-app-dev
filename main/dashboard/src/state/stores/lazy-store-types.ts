import type { signal } from "../../dom/factory/reactive";
import type { DeltaBatch, RowDelta } from "@clansocket/realtime";

export type FetchUnsub = () => void;

export interface DeltaFeed<T> {
    topic: string;
    subscribe: (sink: (batch: DeltaBatch) => void) => FetchUnsub;
    apply?: (current: T, delta: RowDelta) => T;
}

export interface FetchStore {
    refresh(): Promise<void>;
    teardown(): void;
    ensure(): void;
}

export interface FetchStoreConfig<T, K extends string> {
    key: K;
    initial: T;
    load: () => Promise<T>;
    subscribe: (refetch: () => void) => FetchUnsub;
    delta?: DeltaFeed<T>;
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
    rethrow?: boolean;
}

export interface FetchStoreState<T> {
    data: ReturnType<typeof signal<T>>;
    started: boolean;
    unsub: FetchUnsub | null;
    unsubVisibility: FetchUnsub | null;
}
