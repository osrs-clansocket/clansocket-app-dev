import { BoundedCache, type BoundedCacheOpts } from "./bounded-cache.js";

export class AsyncMemoCache<K, V> extends BoundedCache<K, V> {
    private readonly inflight = new Map<K, Promise<V>>();

    constructor(opts: BoundedCacheOpts<K, V>) {
        super(opts);
    }

    async getOrLoad(key: K, loader: () => Promise<V>): Promise<V> {
        const cached = this.get(key);
        if (cached !== undefined) return cached;
        const pending = this.inflight.get(key);
        if (pending !== undefined) return pending;
        const promise = loader()
            .then((value) => {
                this.set(key, value);
                this.inflight.delete(key);
                return value;
            })
            .catch((err: unknown) => {
                this.inflight.delete(key);
                throw err;
            });
        this.inflight.set(key, promise);
        return promise;
    }
}
