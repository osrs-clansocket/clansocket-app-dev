import type { ReadSignal } from "../../dom/factory/reactive";
import { bindVisibilityRefresh } from "./lazy-store-visibility.js";
import type { DeltaFeed, FetchStore, FetchStoreConfig, FetchStoreState, FetchUnsub } from "./lazy-store-types.js";

export function buildStoreOps<T, K extends string>(
    state: FetchStoreState<T>,
    fetchOnce: () => Promise<void>,
    subscribeDelta: (feed: DeltaFeed<T>) => FetchUnsub,
    config: FetchStoreConfig<T, K>,
): { ensure: () => void; teardown: () => void } {
    const ensure = (): void => {
        if (state.started) return;
        state.started = true;
        void fetchOnce();
        state.unsub = config.delta ? subscribeDelta(config.delta) : config.subscribe(() => void fetchOnce());
        state.unsubVisibility = bindVisibilityRefresh(fetchOnce);
    };
    const teardown = (): void => {
        state.unsub?.();
        state.unsub = null;
        state.unsubVisibility?.();
        state.unsubVisibility = null;
        state.started = false;
    };
    return { ensure, teardown };
}

export function attachFetchAccessor<T, K extends string>(
    store: FetchStore,
    config: FetchStoreConfig<T, K>,
    state: FetchStoreState<T>,
    ensure: () => void,
): void {
    Object.defineProperty(store, config.key, {
        get(): ReadSignal<T> {
            ensure();
            return state.data;
        },
        enumerable: true,
    });
}
