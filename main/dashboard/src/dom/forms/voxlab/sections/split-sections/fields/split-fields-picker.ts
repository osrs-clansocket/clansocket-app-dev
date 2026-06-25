export function pick<T extends object, K extends keyof T>(source: T, keys: ReadonlyArray<K>): Pick<T, K> {
    const out = {} as Pick<T, K>;
    for (const key of keys) out[key] = source[key];
    return out;
}
