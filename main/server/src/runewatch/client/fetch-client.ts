import { projectRows, type RunewatchUpstreamRow } from "./fetch-row-coercer.js";

export const RUNEWATCH_MIXEDLIST_URL =
    "https://raw.githubusercontent.com/while-loop/runelite-plugins/runewatch-updater/mixedlist.json";

const FETCH_TIMEOUT_MS = 30000;
const USER_AGENT = "ClanSocket/runewatch-sync (+https://clansocket.com)";

export type { RunewatchUpstreamRow } from "./fetch-row-coercer.js";

export type RunewatchFetchResult =
    | { ok: true; rows: RunewatchUpstreamRow[] }
    | { ok: false; reason: "http_error" | "parse_error" | "shape_error"; detail: string };

type FetchFailReason = "http_error" | "parse_error" | "shape_error";
type ParseOutcome = { ok: true; parsed: unknown } | { ok: false; reason: "parse_error"; detail: string };

const fetchFail = <R extends FetchFailReason>(reason: R, detail: string) => ({ ok: false as const, reason, detail });

async function readJsonBody(res: Response): Promise<ParseOutcome> {
    const body = await res.text();
    try {
        return { ok: true, parsed: JSON.parse(body) };
    } catch (err) {
        return fetchFail("parse_error", String(err));
    }
}

export async function fetchRunewatchMixedlist(): Promise<RunewatchFetchResult> {
    try {
        const res = await fetch(RUNEWATCH_MIXEDLIST_URL, {
            headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!res.ok) return fetchFail("http_error", `HTTP ${res.status}`);
        const parsedResult = await readJsonBody(res);
        if (!parsedResult.ok) return parsedResult;
        if (!Array.isArray(parsedResult.parsed)) return fetchFail("shape_error", "root is not an array");
        return { ok: true, rows: projectRows(parsedResult.parsed) };
    } catch (err) {
        return fetchFail("http_error", String(err));
    }
}
