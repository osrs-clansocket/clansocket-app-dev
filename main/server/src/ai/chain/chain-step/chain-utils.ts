import { promptLoader } from "../../persona/prompt-loader/index.js";
import { inRange } from "../../../shared/parsers/ascii-codes.js";
import type { ChainEvent } from "./types.js";

export function resolvePinItems(ids: string[], siteAccountId: string): { id: string; content: string }[] {
    if (ids.length === 0) return [];
    const files = promptLoader.resolveByIds(ids, { siteAccountId, pageState: null });
    const byId: Record<string, string> = {};
    for (const f of files) byId[f.id] = f.content;
    return ids.map((id) => ({ id, content: byId[id] ?? "" }));
}

export function autoPinEvent(ids: string[], siteAccountId: string): ChainEvent {
    return {
        type: "pin",
        payload: { ids, auto: true, items: resolvePinItems(ids, siteAccountId) },
    };
}

function isWordChar(ch: string): boolean {
    return inRange(ch, "A", "Z") || inRange(ch, "a", "z") || inRange(ch, "0", "9") || ch === "_";
}

const FROM_PADDING_LENGTH = " FROM ".length;
const DISPLAY_TEXT_MAX = 200;
const DISPLAY_TEXT_TRUNCATE = 197;

export function tableAfterFrom(sql: string): string | null {
    const upper = sql.toUpperCase();
    const idx = upper.indexOf(" FROM ");
    if (idx < 0) return null;
    let start = idx + FROM_PADDING_LENGTH;
    while (start < sql.length && (sql[start] === " " || sql[start] === "\t")) start++;
    let end = start;
    while (end < sql.length && isWordChar(sql[end]!)) end++;
    const token = sql.slice(start, end);
    return token || null;
}

function truncateForDisplay(raw: string): string {
    return raw.length > DISPLAY_TEXT_MAX ? raw.slice(0, DISPLAY_TEXT_TRUNCATE) + "..." : raw;
}

export function extractDisplayText(raw: string): string {
    try {
        const openIdx = raw.indexOf("{");
        const closeIdx = raw.lastIndexOf("}");
        if (openIdx < 0 || closeIdx <= openIdx) return truncateForDisplay(raw);
        const json = JSON.parse(raw.slice(openIdx, closeIdx + 1));
        return json.message ?? json.recap?.current ?? "Response received";
    } catch {
        return truncateForDisplay(raw);
    }
}
