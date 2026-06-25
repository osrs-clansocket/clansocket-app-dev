export interface CacheMetrics {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
}

export interface BaseCacheOpts {
    readonly tag: string;
}

export interface BaseCache<K, V> {
    readonly tag: string;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    delete(key: K): boolean;
    has(key: K): boolean;
    clear(): void;
    size(): number;
    metrics(): CacheMetrics;
}
