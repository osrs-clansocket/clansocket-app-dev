import type { BaseCache, CacheMetrics } from "../base/base-cache.js";

class CacheRegistry {
    private readonly caches = new Set<BaseCache<unknown, unknown>>();

    register(cache: BaseCache<unknown, unknown>): void {
        this.caches.add(cache);
    }

    unregister(cache: BaseCache<unknown, unknown>): void {
        this.caches.delete(cache);
    }

    flushAll(): void {
        for (const cache of this.caches) cache.clear();
    }

    flushByTag(tag: string): void {
        for (const cache of this.caches) {
            if (cache.tag === tag) cache.clear();
        }
    }

    metrics(): Record<string, CacheMetrics> {
        const out: Record<string, CacheMetrics> = {};
        for (const cache of this.caches) {
            const prev = out[cache.tag];
            const m = cache.metrics();
            out[cache.tag] =
                prev === undefined
                    ? m
                    : {
                          hits: prev.hits + m.hits,
                          misses: prev.misses + m.misses,
                          evictions: prev.evictions + m.evictions,
                          size: prev.size + m.size,
                      };
        }
        return out;
    }

    sizes(): Record<string, number> {
        const out: Record<string, number> = {};
        for (const cache of this.caches) {
            out[cache.tag] = (out[cache.tag] ?? 0) + cache.size();
        }
        return out;
    }

    count(): number {
        return this.caches.size;
    }
}

export const cacheRegistry = new CacheRegistry();
