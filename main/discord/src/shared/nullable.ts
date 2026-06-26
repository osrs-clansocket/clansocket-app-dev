export function orNull<T>(value: T | undefined): T | null {
    return value ?? null;
}

export function orThrow<T>(value: T | null | undefined, message: string): T {
    if (!value) throw new Error(message);
    return value;
}
