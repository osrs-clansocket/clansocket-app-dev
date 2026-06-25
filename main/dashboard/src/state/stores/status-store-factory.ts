import { signal } from "../../dom/factory/reactive/index.js";
import { boundedRegistry } from "./bounded-store-registry.js";

export interface StatusStore<T> {
    status$(): T;
    ensure(): Promise<void>;
    refresh(): Promise<void>;
    dispose(): void;
    teardown(): void;
}

export interface StatusStoreWiring<T> {
    fetch(slug: string): Promise<T>;
    stream(slug: string, onPush: () => void): () => void;
    empty: T;
    maxEntries: number;
}

function buildStore<T>(slug: string, wiring: StatusStoreWiring<T>): StatusStore<T> {
    const sig = signal<T>(wiring.empty);
    const state = { initialized: false, unsubscribe: () => undefined as void };
    const refresh = async (): Promise<void> => sig.set(await wiring.fetch(slug));
    const dispose = (): void => {
        state.unsubscribe();
        state.initialized = false;
    };
    const ensure = async (): Promise<void> => {
        if (state.initialized) return;
        state.initialized = true;
        await refresh();
        state.unsubscribe = wiring.stream(slug, () => void refresh());
    };
    return { ensure, refresh, dispose, status$: () => sig(), teardown: dispose };
}

export function statusStoreRegistry<T>(wiring: StatusStoreWiring<T>): {
    storeFor(slug: string): StatusStore<T>;
    clear(): void;
} {
    const registry = boundedRegistry<StatusStore<T>>(wiring.maxEntries);
    return {
        storeFor: (slug) => registry.get(slug, (k) => buildStore(k, wiring)),
        clear: () => registry.clear(),
    };
}
