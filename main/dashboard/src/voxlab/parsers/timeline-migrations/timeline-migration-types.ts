export type TimelineMigration = (raw: Record<string, unknown>) => Record<string, unknown>;

export function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
