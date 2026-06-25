import type { DerivedKey } from "./crypto";
import { getEntry, type ProviderConfig } from "./vault";
import { BoundedCache } from "../../state/caches/bounded-cache.js";

const plaintextCache = new BoundedCache<string, ProviderConfig>({
    tag: "ai-vault",
    maxEntries: 32,
});

export function clearProviderCache(): void {
    plaintextCache.clear();
}

export function invalidateCachedKey(provider: string): void {
    plaintextCache.delete(provider);
}

export async function loadProviderConfig(
    activeKey: DerivedKey | null,
    provider: string,
): Promise<ProviderConfig | null> {
    const cached = plaintextCache.get(provider);
    if (cached !== undefined) return cached;
    if (!activeKey) return null;
    const config = await getEntry(activeKey, provider);
    if (config !== null) plaintextCache.set(provider, config);
    return config;
}
