export async function drainSerially<T>(
    items: Iterable<T>,
    skipIf: (item: T) => boolean,
    action: (item: T) => Promise<boolean>,
): Promise<number> {
    let count = 0;
    for (const item of items) {
        if (skipIf(item)) continue;
        if (await action(item)) count++;
    }
    return count;
}

export function drainQueue<R>(rows: R[], processor: (row: R) => Promise<void>): Promise<number> {
    return drainSerially<R>(
        rows,
        () => false,
        async (row) => {
            await processor(row);
            return true;
        },
    );
}
