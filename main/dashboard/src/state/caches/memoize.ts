import { BoundedCache } from "./bounded-cache.js";

export interface MemoizeOpts<Args extends unknown[]> {
    readonly tag: string;
    readonly maxEntries: number;
    readonly keyOf: (...args: Args) => string;
    readonly ttlMs?: number;
}

export function memoize<Args extends unknown[], V>(
    fn: (...args: Args) => V,
    opts: MemoizeOpts<Args>,
): (...args: Args) => V {
    const cache = new BoundedCache<string, V>({
        tag: opts.tag,
        maxEntries: opts.maxEntries,
        ttlMs: opts.ttlMs,
    });
    return (...args: Args): V => {
        const key = opts.keyOf(...args);
        const cached = cache.get(key);
        if (cached !== undefined) return cached;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
