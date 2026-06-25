import { DEDUP_SEP } from "../action-types.js";

export function findByKey(key: string): HTMLElement | null {
    const sep = key.lastIndexOf(DEDUP_SEP);
    if (sep > 0) {
        const n = Number(key.slice(sep + 1));
        if (Number.isInteger(n) && n >= 1) {
            const base = key.slice(0, sep);
            return document.querySelectorAll<HTMLElement>(`[data-key="${base}"]`)[n - 1] ?? null;
        }
    }
    return document.querySelector<HTMLElement>(`[data-key="${key}"]`);
}
