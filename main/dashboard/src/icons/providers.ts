import "./families";
import { AsyncMemoCache } from "../state/caches/async-memo-cache.js";
import { memoize } from "../state/caches/memoize.js";
import { iconFamily, iconFamilyDefs, type IconFamilyConfig } from "./registry";

export interface ProviderConfig extends IconFamilyConfig {
    readonly prefix: string;
}

export interface IconEntry {
    readonly provider: string;
    readonly name: string;
}

const DEFAULT_PREFIX = "bi";

const glyphCache = new AsyncMemoCache<string, readonly string[]>({
    tag: "icons",
    maxEntries: 16,
});

function configWithPrefix(prefix: string, config: IconFamilyConfig): ProviderConfig {
    return { prefix, ...config };
}

export function listProviders(): readonly ProviderConfig[] {
    return iconFamilyDefs().map((d) => configWithPrefix(d.prefix, d.config));
}

export function getProvider(prefix: string): ProviderConfig | null {
    const f = iconFamily(prefix);
    return f === undefined ? null : configWithPrefix(f.prefix, f.config);
}

const resolveIconImpl = (value: string): { provider: string; name: string } => {
    const dash = value.indexOf("-");
    if (dash < 0) return { provider: DEFAULT_PREFIX, name: value };
    const candidate = value.slice(0, dash);
    if (iconFamily(candidate) !== undefined) return { provider: candidate, name: value.slice(dash + 1) };
    return { provider: DEFAULT_PREFIX, name: value };
};

export const resolveIcon = memoize(resolveIconImpl, {
    tag: "icons",
    maxEntries: 512,
    keyOf: (value) => value,
});

export function buildIconSrc(provider: string, name: string): string | null {
    const f = iconFamily(provider);
    if (!f || f.config.kind !== "raster" || !f.config.resolveSrc) return null;
    return f.config.resolveSrc(name);
}

export function isRasterProvider(provider: string): boolean {
    const f = iconFamily(provider);
    return f !== undefined && f.config.kind === "raster";
}

export async function loadIcons(): Promise<readonly IconEntry[]> {
    const families = iconFamilyDefs();
    const pending: Promise<readonly string[]>[] = [];
    for (const f of families) {
        pending.push(glyphCache.getOrLoad(f.prefix, async () => f.glyphLoader()));
    }
    const lists = await Promise.all(pending);
    const out: IconEntry[] = [];
    for (let i = 0; i < families.length; i += 1) {
        const prefix = families[i]!.prefix;
        for (const name of lists[i]!) out.push({ provider: prefix, name });
    }
    return out;
}
