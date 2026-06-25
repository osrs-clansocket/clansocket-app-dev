import type { BaseCache, CacheMetrics } from "./base/base-cache.js";
import { cacheRegistry } from "./registry/cache-registry.js";

export interface WeakCacheOpts {
    readonly tag: string;
}

export class WeakRefCache<K extends object, V> implements BaseCache<K, V> {
    readonly tag: string;
    private readonly entries = new WeakMap<K, V>();
    private hitCount = 0;
    private missCount = 0;

    constructor(opts: WeakCacheOpts) {
        this.tag = opts.tag;
        cacheRegistry.register(this as BaseCache<unknown, unknown>);
    }

    get(key: K): V | undefined {
        const value = this.entries.get(key);
        if (value === undefined) {
            this.missCount++;
            return undefined;
        }
        this.hitCount++;
        return value;
    }

    set(key: K, value: V): void {
        this.entries.set(key, value);
    }

    delete(key: K): boolean {
        return this.entries.delete(key);
    }

    has(key: K): boolean {
        return this.entries.has(key);
    }

    clear(): void {}

    size(): number {
        return 0;
    }

    metrics(): CacheMetrics {
        return {
            hits: this.hitCount,
            misses: this.missCount,
            evictions: 0,
            size: 0,
        };
    }
}
