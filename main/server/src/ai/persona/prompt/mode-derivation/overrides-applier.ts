export function applyOverrides(overrides: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(overrides)) {
        out[`__${key}__`] = value;
    }
    return out;
}
