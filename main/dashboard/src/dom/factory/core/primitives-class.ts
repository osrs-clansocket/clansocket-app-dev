export function joinClasses(base: string, extra: readonly string[] | undefined): readonly string[] {
    return extra && extra.length > 0 ? [base, ...extra] : [base];
}

export function resolveClasses(
    baseClass: string | null,
    extra: readonly string[] | undefined,
): readonly string[] | undefined {
    if (baseClass) return joinClasses(baseClass, extra);
    return extra;
}
