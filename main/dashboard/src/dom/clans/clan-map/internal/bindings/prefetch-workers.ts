const PREFETCH_INFLIGHT = 8;

export async function runWorkers<T>(
    items: readonly T[],
    task: (item: T) => Promise<void>,
    isCancelled: () => boolean,
): Promise<void> {
    let index = 0;
    const worker = async (): Promise<void> => {
        while (index < items.length && !isCancelled()) {
            const item = items[index]!;
            index++;
            await task(item);
        }
    };
    const workers: Promise<void>[] = [];
    const limit = Math.min(PREFETCH_INFLIGHT, items.length);
    for (let i = 0; i < limit; i++) workers.push(worker());
    await Promise.all(workers);
}
