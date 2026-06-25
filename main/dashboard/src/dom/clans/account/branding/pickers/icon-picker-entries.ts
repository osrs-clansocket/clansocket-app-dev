import { loadIcons, type IconEntry } from "../../../../../icons/providers.js";

const MIN_SEARCH_LEN = 1;

let allKeys: readonly string[] | null = null;
let entriesPromise: Promise<readonly string[]> | null = null;
let lastFilter: { needle: string; matches: readonly string[] } = { needle: "", matches: [] };

function entriesToKeys(entries: readonly IconEntry[]): readonly string[] {
    const out: string[] = Array.from<string>({ length: entries.length });
    for (let i = 0; i < entries.length; i += 1) {
        const e = entries[i]!;
        out[i] = `${e.provider}-${e.name}`;
    }
    return out;
}

export function filterKeys(needle: string): readonly string[] {
    const keys = allKeys ?? [];
    if (needle === lastFilter.needle && lastFilter.matches.length > 0) return lastFilter.matches;
    if (needle.length < MIN_SEARCH_LEN) {
        lastFilter = { needle, matches: keys };
        return keys;
    }
    const lower = needle.toLowerCase();
    const matches: string[] = [];
    for (const k of keys) if (k.includes(lower)) matches.push(k);
    lastFilter = { needle, matches };
    return matches;
}

export async function ensureEntries(): Promise<readonly string[]> {
    if (allKeys) return allKeys;
    if (entriesPromise) return entriesPromise;
    entriesPromise = loadIcons().then((entries) => {
        const keys = entriesToKeys(entries);
        allKeys = keys;
        lastFilter = { needle: "", matches: keys };
        return keys;
    });
    return entriesPromise;
}
