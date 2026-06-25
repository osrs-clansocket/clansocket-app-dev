export function migrate6to7(raw: Record<string, unknown>): Record<string, unknown> {
    return { ...raw, schemaVersion: 7 };
}
