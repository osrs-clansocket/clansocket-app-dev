import type { FetchStoreConfig, FetchStoreState } from "./lazy-store-types.js";

export function makeFetchOnce<T, K extends string>(
    state: FetchStoreState<T>,
    config: FetchStoreConfig<T, K>,
): () => Promise<void> {
    return async () => {
        try {
            state.data.set(await config.load());
            config.onSuccess?.();
        } catch (err) {
            if (config.onError) config.onError(err);
            else if (config.rethrow) throw err;
        }
    };
}
