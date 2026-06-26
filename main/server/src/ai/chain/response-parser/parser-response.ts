import { normalizeActions } from "./actions.js";
import { clampPollSeconds, normalizeQuery, type DbQuery, type ParsedResponse } from "./types.js";

const CODE_FENCE = "```";
const JSON_TAG = "json";

function extractFenced(text: string): string | null {
    const fenceStart = text.indexOf(CODE_FENCE);
    if (fenceStart < 0) return null;
    let contentStart = fenceStart + CODE_FENCE.length;
    if (text.slice(contentStart, contentStart + JSON_TAG.length).toLowerCase() === JSON_TAG) {
        contentStart += JSON_TAG.length;
    }
    while (contentStart < text.length && (text[contentStart] === " " || text[contentStart] === "\t")) contentStart++;
    if (text[contentStart] === "\n") contentStart++;
    const fenceEnd = text.indexOf(CODE_FENCE, contentStart);
    return fenceEnd > fenceStart ? text.slice(contentStart, fenceEnd).trim() : null;
}

function extractJson(text: string): string | null {
    const fenced = extractFenced(text);
    if (fenced !== null) return fenced;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    return end > start && start >= 0 ? text.slice(start, end + 1) : null;
}

function tryParse(json: string | null): Record<string, unknown> {
    if (json === null) return {};
    try {
        const parsed = JSON.parse(json);
        return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
}

const isString = (x: unknown): x is string => typeof x === "string";
const isPlainObj = (x: unknown): x is Record<string, unknown> =>
    x !== null && typeof x === "object" && !Array.isArray(x);

const filterArrayBy = <T>(v: unknown, guard: (x: unknown) => x is T): T[] => (Array.isArray(v) ? v.filter(guard) : []);

const asString = (v: unknown): string | null => (isString(v) ? v : null);
const asStringArr = (v: unknown): string[] => filterArrayBy(v, isString);
const asObj = (v: unknown): Record<string, unknown> | null => (isPlainObj(v) ? v : null);
const asObjArr = (v: unknown): Record<string, unknown>[] => filterArrayBy(v, isPlainObj);

function asStatus(v: unknown): string | string[] | null {
    if (isString(v)) return v;
    if (Array.isArray(v)) return filterArrayBy(v, isString);
    return null;
}

function asQueries(v: unknown): DbQuery[] {
    if (!Array.isArray(v)) return [];
    return v.map(normalizeQuery).filter((q): q is DbQuery => q !== null);
}

export function parseResponse(raw: string): ParsedResponse {
    const obj = tryParse(extractJson(raw));
    return {
        actions: normalizeActions(obj.actions),
        message: asString(obj.message),
        status: asStatus(obj.status),
        suggested_user_response: asString(obj.suggested_user_response),
        next_context: asStringArr(obj.next_context),
        chain: obj.chain === true,
        read: asStringArr(obj.read),
        query: asQueries(obj.query),
        pin: asStringArr(obj.pin),
        unpin: asStringArr(obj.unpin),
        profile_context: asObj(obj.profile_context),
        memory: Array.isArray(obj.memory) ? asObjArr(obj.memory) : null,
        recap: asObj(obj.recap),
        next_poll_seconds: clampPollSeconds(obj.next_poll_seconds),
    };
}
