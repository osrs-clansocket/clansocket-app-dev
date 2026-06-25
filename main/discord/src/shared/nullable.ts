export function orNull<T>(value: T | undefined): T | null {
    return value ?? null;
}
