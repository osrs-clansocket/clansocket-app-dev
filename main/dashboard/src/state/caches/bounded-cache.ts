import type { BaseCache, BaseCacheOpts, CacheMetrics } from "./base/base-cache.js";
import { cacheRegistry } from "./registry/cache-registry.js";

export type BoundedEvictionPolicy = "lru" | "fifo";

export interface BoundedCacheOpts<K, V> extends BaseCacheOpts {
    readonly maxEntries: number;
    readonly evictionPolicy?: BoundedEvictionPolicy;
    readonly ttlMs?: number;
    readonly onEvict?: (key: K, value: V) => void;
}

interface BoundedEntry<V> {
    value: V;
    insertedAt: number;
}

const NO_TTL = 0;

export class BoundedCache<K, V> implements BaseCache<K, V> {
    readonly tag: string;
    private readonly maxEntries: number;
    private readonly evictionPolicy: BoundedEvictionPolicy;
    private readonly ttlMs: number;
    private readonly onEvict: ((key: K, value: V) => void) | undefined;
    private readonly entries = new Map<K, BoundedEntry<V>>();
    private hitCount = 0;
    private missCount = 0;
    private evictionCount = 0;

    constructor(opts: BoundedCacheOpts<K, V>) {
        this.tag = opts.tag;
        this.maxEntries = opts.maxEntries;
        this.evictionPolicy = opts.evictionPolicy ?? "lru";
        this.ttlMs = opts.ttlMs ?? NO_TTL;
        this.onEvict = opts.onEvict;
        cacheRegistry.register(this as BaseCache<unknown, unknown>);
    }

    private isExpired(entry: BoundedEntry<V>, now: number): boolean {
        return this.ttlMs > 0 && now - entry.insertedAt > this.ttlMs;
    }

    private touch(key: K, entry: BoundedEntry<V>): void {
        if (this.evictionPolicy !== "lru") return;
        this.entries.delete(key);
        this.entries.set(key, entry);
    }

    get(key: K): V | undefined {
        const entry = this.entries.get(key);
        if (entry === undefined) {
            this.missCount++;
            return undefined;
        }
        if (this.isExpired(entry, Date.now())) {
            this.entries.delete(key);
            this.onEvict?.(key, entry.value);
            this.evictionCount++;
            this.missCount++;
            return undefined;
        }
        this.touch(key, entry);
        this.hitCount++;
        return entry.value;
    }

    set(key: K, value: V): void {
        const existing = this.entries.get(key);
        if (existing !== undefined) {
            this.entries.delete(key);
        }
        this.entries.set(key, { value, insertedAt: Date.now() });
        this.evictOverflow();
    }

    private evictOverflow(): void {
        while (this.entries.size > this.maxEntries) {
            const oldestKey = this.entries.keys().next().value;
            if (oldestKey === undefined) return;
            const oldest = this.entries.get(oldestKey);
            this.entries.delete(oldestKey);
            if (oldest !== undefined) this.onEvict?.(oldestKey, oldest.value);
            this.evictionCount++;
        }
    }

    delete(key: K): boolean {
        const entry = this.entries.get(key);
        if (entry === undefined) return false;
        this.entries.delete(key);
        this.onEvict?.(key, entry.value);
        this.evictionCount++;
        return true;
    }

    has(key: K): boolean {
        const entry = this.entries.get(key);
        if (entry === undefined) return false;
        if (this.isExpired(entry, Date.now())) {
            this.entries.delete(key);
            this.onEvict?.(key, entry.value);
            this.evictionCount++;
            return false;
        }
        return true;
    }

    clear(): void {
        this.entries.clear();
    }

    size(): number {
        return this.entries.size;
    }

    metrics(): CacheMetrics {
        return {
            hits: this.hitCount,
            misses: this.missCount,
            evictions: this.evictionCount,
            size: this.entries.size,
        };
    }
}
