export function findOrNull<T>(arr: readonly T[], pred: (v: T) => boolean): T | null {
    return arr.find(pred) ?? null;
}
