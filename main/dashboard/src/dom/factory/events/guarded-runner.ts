import { trackAsync } from "./async-tracker.js";

function clearSelection(): void {
    window.getSelection()?.removeAllRanges();
}

export function runGuarded<E extends Event>(
    el: HTMLButtonElement | HTMLFormElement,
    e: E,
    handler: (e: E) => void | Promise<void>,
): void {
    clearSelection();
    const result = handler(e);
    if (result instanceof Promise) void trackAsync(el, result).catch(() => undefined);
}
