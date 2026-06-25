import type { HistoryEntry } from "../../../../managers/voxlab/services/history-service.js";

const NUM_FIXED_DIGITS = 3;

export function describeEntry(entry: HistoryEntry): string {
    return `${formatPath(entry.path)} ${formatValue(entry.prevValue)} → ${formatValue(entry.nextValue)}`;
}

export function formatPath(path: string): string {
    return path;
}

export function formatValue(value: unknown): string {
    if (typeof value === "number") return trimZeros(value.toFixed(NUM_FIXED_DIGITS));
    if (typeof value === "string") return value;
    if (typeof value === "boolean") return value ? "on" : "off";
    if (value === undefined) return "·";
    return JSON.stringify(value);
}

function trimZeros(s: string): string {
    if (!s.includes(".")) return s;
    let end = s.length;
    while (end > 0 && s.charAt(end - 1) === "0") end--;
    if (end > 0 && s.charAt(end - 1) === ".") end--;
    return s.slice(0, end);
}
