import { collapseWhitespace } from "./collapse-whitespace.js";

const MESSAGE_PREVIEW_CHARS = 120;

interface EventEntry {
    type: string;
    payload: Record<string, unknown>;
}

function summarizeQuery(payload: Record<string, unknown>): string {
    const sql = typeof payload.sql === "string" ? collapseWhitespace(payload.sql).slice(0, 120) : "";
    const rows = typeof payload.rows === "number" ? `${payload.rows} rows` : "";
    const err = typeof payload.error === "string" && payload.error.length > 0 ? `error: ${payload.error}` : "";
    return `[query ${String(payload.db ?? "?")}] ${sql} → ${err || rows}`;
}

const EVENT_SUMMARIZERS: Record<string, (p: Record<string, unknown>) => string> = {
    status: (p) => `[status] ${String(p.status ?? "")}`,
    read: (p) => `[read] ${String(p.id ?? "?")}`,
    query: (p) => summarizeQuery(p),
    memory: (p) => `[memory] ${String(p.id ?? "?")} ${p.ok === true ? "ok" : "fail"}`,
    pin: (p) => `[pin] ${(p.ids as string[] | undefined)?.join(", ") ?? "?"}`,
    unpin: (p) => `[unpin] ${(p.ids as string[] | undefined)?.join(", ") ?? "?"}`,
    chain: (p) => `[chain depth ${String(p.depth ?? "?")}] ${String(p.message ?? "").slice(0, MESSAGE_PREVIEW_CHARS)}`,
    continuation: (p) => `[continuation] ${String(p.turn ?? "")}`,
    append: (p) => `[user appended] ${String(p.text ?? "").slice(0, MESSAGE_PREVIEW_CHARS)}`,
};

export function summarizeEvent(entry: EventEntry): string {
    const summarizer = EVENT_SUMMARIZERS[entry.type];
    return summarizer ? summarizer(entry.payload) : `[${entry.type}]`;
}
