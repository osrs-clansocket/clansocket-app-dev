import { signal, type ReadSignal } from "../../dom/factory/reactive";
import { attachFetchAccessor, buildStoreOps } from "./lazy-store-ops.js";
import { makeFetchOnce } from "./store-fetch-once.js";
import { makeSubscribeDelta } from "./store-delta-subscribe.js";
import type { FetchStore, FetchStoreConfig, FetchStoreState } from "./lazy-store-types.js";

export type { DeltaFeed, FetchStore, FetchStoreConfig, FetchUnsub } from "./lazy-store-types.js";
export { pollFetch, onEvent } from "./lazy-store-subscribers.js";

export function createFetchStore<T, K extends string>(
    config: FetchStoreConfig<T, K>,
): FetchStore & { readonly [P in K]: ReadSignal<T> } {
    const state: FetchStoreState<T> = {
        data: signal<T>(config.initial),
        started: false,
        unsub: null,
        unsubVisibility: null,
    };
    const fetchOnce = makeFetchOnce(state, config);
    const subscribeDelta = makeSubscribeDelta(state);
    const { ensure, teardown } = buildStoreOps(state, fetchOnce, subscribeDelta, config);
    const store: FetchStore = {
        refresh: () => {
            ensure();
            return fetchOnce();
        },
        teardown,
        ensure,
    };
    attachFetchAccessor(store, config, state, ensure);
    return store as FetchStore & { readonly [P in K]: ReadSignal<T> };
}
