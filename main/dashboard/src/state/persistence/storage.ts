const NS_PREFIX = "clansocket.";
const LEGACY_PREFIX = "clansocket:";
const SENTINEL = "__cs_v1__";

interface StoredEnvelope<T> {
    v: T;
    s: string;
}

export function readStored<T>(key: string): T | undefined {
    try {
        const raw = localStorage.getItem(NS_PREFIX + key);
        if (raw === null) return undefined;
        const parsed = JSON.parse(raw) as StoredEnvelope<T> | null;
        if (parsed === null || typeof parsed !== "object") return undefined;
        if (parsed.s !== SENTINEL) return undefined;
        return parsed.v;
    } catch {
        return undefined;
    }
}

export function writeStored<T>(key: string, value: T): void {
    try {
        const envelope: StoredEnvelope<T> = { v: value, s: SENTINEL };
        localStorage.setItem(NS_PREFIX + key, JSON.stringify(envelope));
    } catch {
        return;
    }
}

export function clearStored(key: string): void {
    try {
        localStorage.removeItem(NS_PREFIX + key);
    } catch {
        return;
    }
}

interface LegacyEntry {
    legacy: string;
    suffix: string;
    raw: string;
}

function readLegacyAt(index: number): LegacyEntry | null {
    const legacy = localStorage.key(index);
    if (legacy === null || !legacy.startsWith(LEGACY_PREFIX)) return null;
    const raw = localStorage.getItem(legacy);
    if (raw === null) return null;
    return { legacy, raw, suffix: legacy.slice(LEGACY_PREFIX.length) };
}

export function migrateLegacyKeys(): void {
    try {
        const stash: LegacyEntry[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const entry = readLegacyAt(i);
            if (entry !== null) stash.push(entry);
        }
        for (const entry of stash) {
            if (localStorage.getItem(NS_PREFIX + entry.suffix) === null) {
                writeStored(entry.suffix, entry.raw);
            }
            localStorage.removeItem(entry.legacy);
        }
    } catch {
        return;
    }
}
