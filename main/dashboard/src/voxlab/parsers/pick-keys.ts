export function pickKeys(source: Record<string, unknown>, keys: ReadonlyArray<string>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of keys) {
        if (source[key] !== undefined) {
            out[key] = source[key];
        }
    }
    return out;
}
