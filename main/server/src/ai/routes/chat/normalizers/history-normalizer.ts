import type { HistoryEntry } from "../../../chain/chain-state-store.js";
import { asArray, asFiniteNumber, asObject, asString } from "../../../../shared/coerce.js";
import { isAiRole, type AiRole } from "../../../types.js";

const MAX_HISTORY_CHARS = 12000;
const HISTORY_HEAD_CHARS = 300;
const HISTORY_TAIL_BUDGET = 400;
const MESSAGES_PER_TURN = 2;

export function formatHistoryTimestamp(timestamp: number | undefined): string {
    if (timestamp === undefined || !Number.isFinite(timestamp)) return "no-ts";
    return new Date(timestamp).toISOString().replace("T", " ").replace(".000Z", "Z");
}

function truncateHistoryBlock(out: string): string {
    if (out.length <= MAX_HISTORY_CHARS) return out;
    const head = out.slice(0, HISTORY_HEAD_CHARS);
    const tail = out.slice(-(MAX_HISTORY_CHARS - HISTORY_TAIL_BUDGET));
    return `${head}\n\n[... truncated ${out.length - MAX_HISTORY_CHARS} chars from the middle ...]\n\n${tail}`;
}

export function formatClientHistory(
    entries: { role: AiRole; content: string; timestamp?: number }[],
    windowTurns?: number,
): string {
    if (entries.length === 0) return "No chat history — this is the first turn, or the user cleared it.";
    const sliced = windowTurns !== undefined ? entries.slice(-windowTurns * MESSAGES_PER_TURN) : entries;
    const lines: string[] = [`[CHAT HISTORY — last ${sliced.length} messages, newest last. Timestamps are UTC.]`];
    for (let i = 0; i < sliced.length; i++) {
        const m = sliced[i]!;
        lines.push(`[turn ${i + 1}] [${formatHistoryTimestamp(m.timestamp)}] ${m.role}: ${m.content}`);
    }
    return truncateHistoryBlock(lines.join("\n"));
}

function normalizeTimestamp(raw: unknown): number | undefined {
    const n = asFiniteNumber(raw);
    if (n !== null) return n;
    const s = asString(raw);
    if (s !== null) {
        const parsed = Date.parse(s);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function readHistoryEntry(raw: unknown): HistoryEntry | null {
    const e = asObject(raw);
    if (e === null) return null;
    const role = e.role;
    if (!isAiRole(role)) return null;
    const content = asString(e.content);
    if (content === null) return null;
    return { role, content, timestamp: normalizeTimestamp(e.timestamp) };
}

export function normalizeHistory(raw: unknown): HistoryEntry[] {
    const arr = asArray(raw);
    if (arr === null) return [];
    const out: HistoryEntry[] = [];
    for (const item of arr) {
        const entry = readHistoryEntry(item);
        if (entry !== null) out.push(entry);
    }
    return out;
}
