import { normalizeActions } from "./actions.js";
import { clampPollSeconds, normalizeQuery, type DbQuery, type ParsedResponse } from "./types.js";

export type { DbQuery, ParsedResponse } from "./types.js";

const CODE_FENCE = "```";
const JSON_TAG = "json";

function extractJson(text: string): string | null {
    const fenceStart = text.indexOf(CODE_FENCE);
    if (fenceStart !== -1) {
        let contentStart = fenceStart + CODE_FENCE.length;
        if (text.slice(contentStart, contentStart + JSON_TAG.length).toLowerCase() === JSON_TAG) {
            contentStart += JSON_TAG.length;
        }
        while (contentStart < text.length && (text[contentStart] === " " || text[contentStart] === "\t"))
            contentStart++;
        if (text[contentStart] === "\n") contentStart++;
        const fenceEnd = text.indexOf(CODE_FENCE, contentStart);
        if (fenceEnd !== -1) return text.slice(contentStart, fenceEnd).trim();
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) return text.slice(start, end + 1);
    return null;
}

function normalizeSuggestedUser(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function fallback(text: string): ParsedResponse {
    return { ...projectParsed({}), message: text };
}

function normalizeStatus(raw: unknown): string | string[] | null {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw as string[];
    return null;
}

function normalizeQueries(raw: unknown): DbQuery[] {
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeQuery).filter((q): q is DbQuery => q !== null);
}

function normalizeStringArray(raw: unknown): string[] {
    return Array.isArray(raw) ? (raw as string[]) : [];
}

function normalizeRecap(raw: unknown): Record<string, string> | null {
    return raw && typeof raw === "object" ? (raw as Record<string, string>) : null;
}

function projectParsed(json: Record<string, unknown>): ParsedResponse {
    return {
        actions: normalizeActions(json.actions),
        message: (json.message as string | null) ?? null,
        status: normalizeStatus(json.status),
        suggested_user_response: normalizeSuggestedUser(json.suggested_user_response),
        next_context: (json.next_context as string[] | undefined) ?? [],
        chain: json.chain === true,
        read: normalizeStringArray(json.read),
        query: normalizeQueries(json.query),
        pin: normalizeStringArray(json.pin),
        unpin: normalizeStringArray(json.unpin),
        profile_context: (json.profile_context as Record<string, unknown> | null) ?? null,
        memory: Array.isArray(json.memory) ? json.memory : null,
        recap: normalizeRecap(json.recap),
        next_poll_seconds: clampPollSeconds(json.next_poll_seconds),
    };
}

export function parseResponse(text: string): ParsedResponse {
    const raw = extractJson(text);
    if (!raw) return fallback(text);
    try {
        return projectParsed(JSON.parse(raw) as Record<string, unknown>);
    } catch {
        return fallback(text);
    }
}
