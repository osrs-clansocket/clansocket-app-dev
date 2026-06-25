const DEFAULT_LIMIT = 8;

export async function runWithLimit<T, R>(
    items: readonly T[],
    limit: number,
    worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const cap = limit > 0 ? limit : DEFAULT_LIMIT;
    const results: R[] = Array.from<R>({ length: items.length });
    let cursor = 0;
    async function pump(): Promise<void> {
        while (cursor < items.length) {
            const i = cursor;
            cursor++;
            results[i] = await worker(items[i]!, i);
        }
    }
    const workerCount = Math.min(cap, items.length);
    const pumps: Promise<void>[] = [];
    for (let i = 0; i < workerCount; i++) pumps.push(pump());
    await Promise.all(pumps);
    return results;
}
