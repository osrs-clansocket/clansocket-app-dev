export { formatNumber } from "./number-format.js";
export { formatDuration } from "./duration-format.js";

const SESSION_PREVIEW_CHARS = 8;

export function formatSid(sid: string): string {
    return sid.slice(0, SESSION_PREVIEW_CHARS);
}

export function formatPad(s: string, width: number): string {
    if (s.length === width) return s;
    if (s.length > width) return s.slice(0, width - 1) + "…";
    return s.padEnd(width);
}
