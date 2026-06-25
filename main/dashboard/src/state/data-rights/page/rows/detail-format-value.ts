const MS_EPOCH_MIN = 1_000_000_000_000;
const ISO_DATETIME_LEN = 19;

export function formatValue(v: unknown): string {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number" && v > MS_EPOCH_MIN)
        return new Date(v).toISOString().replace("T", " ").slice(0, ISO_DATETIME_LEN);
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
}
