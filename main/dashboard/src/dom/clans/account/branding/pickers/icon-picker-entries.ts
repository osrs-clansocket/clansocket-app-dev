import { loadIcons, type IconEntry } from "../../../../../icons/providers.js";

const MIN_SEARCH_LEN = 1;

let allKeys: readonly string[] | null = null;
let entriesPromise: Promise<readonly string[]> | null = null;

function entriesToKeys(entries: readonly IconEntry[]): readonly string[] {
    const out: string[] = Array.from<string>({ length: entries.length });
    for (let i = 0; i < entries.length; i += 1) {
        const e = entries[i]!;
        out[i] = `${e.provider}-${e.name}`;
    }
    return out;
}

function keysForFamily(family: string): readonly string[] {
    if (!allKeys) return [];
    const prefix = `${family}-`;
    const out: string[] = [];
    for (const k of allKeys) if (k.startsWith(prefix)) out.push(k);
    return out;
}

export function filterFamilyKeys(family: string, needle: string): readonly string[] {
    const inFamily = keysForFamily(family);
    if (needle.length < MIN_SEARCH_LEN) return inFamily;
    const lower = needle.toLowerCase();
    const out: string[] = [];
    for (const k of inFamily) if (k.includes(lower)) out.push(k);
    return out;
}

export async function ensureEntries(): Promise<readonly string[]> {
    if (allKeys) return allKeys;
    if (entriesPromise) return entriesPromise;
    entriesPromise = loadIcons().then((entries) => {
        const keys = entriesToKeys(entries);
        allKeys = keys;
        return keys;
    });
    return entriesPromise;
}
