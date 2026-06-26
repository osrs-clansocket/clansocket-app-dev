export function mapBy<T, V>(
    items: readonly T[],
    keyFn: (item: T) => string,
    valueFn: (item: T) => V,
): Record<string, V> {
    const r: Record<string, V> = {};
    for (const item of items) r[keyFn(item)] = valueFn(item);
    return r;
}

export function indexBy<T>(items: readonly T[], keyFn: (item: T) => string): Record<string, T> {
    return mapBy(items, keyFn, (item) => item);
}
