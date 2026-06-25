export function waitForRaf(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function yieldMicrotask(): Promise<void> {
    return Promise.resolve();
}
