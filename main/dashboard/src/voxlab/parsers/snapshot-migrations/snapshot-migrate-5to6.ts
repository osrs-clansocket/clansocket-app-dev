export function migrate5to6(raw: Record<string, unknown>): Record<string, unknown> {
    return { ...raw, schemaVersion: 6 };
}
