import { ISO_DATETIME_LEN, MS_EPOCH_MIN, TRUNCATE_AT } from "./summary-constants.js";

export function truncate(s: string): string {
    if (s.length <= TRUNCATE_AT) return s;
    return `${s.slice(0, TRUNCATE_AT - 1)}…`;
}

export function formatVal(v: unknown): string {
    if (v === null || v === undefined) return "";
    if (typeof v === "number" && v > MS_EPOCH_MIN)
        return new Date(v).toISOString().replace("T", " ").slice(0, ISO_DATETIME_LEN);
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
}

export function field(row: Record<string, unknown>, col: string): string {
    if (!col) return "";
    return truncate(formatVal(row[col]));
}
