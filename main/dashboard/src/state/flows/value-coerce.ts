export function asString(v: unknown): string {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    return String(v);
}

export function asBoolean(v: unknown): boolean {
    return Boolean(v);
}
