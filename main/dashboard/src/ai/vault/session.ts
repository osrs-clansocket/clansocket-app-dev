import type { DerivedKey } from "./crypto";
import type { ProviderConfig } from "./vault";
import { clearPersistedSession, loadPersistedKey, persistSession } from "./session-persist.js";
import { notify } from "./session-listeners.js";
import { clearProviderCache, loadProviderConfig } from "./session-cache.js";

export { onLockChange } from "./session-listeners.js";
export { invalidateCachedKey } from "./session-cache.js";

let activeKey: DerivedKey | null = null;

export function setActiveKey(key: DerivedKey): void {
    activeKey = key;
    clearProviderCache();
    persistSession(key);
    notify(true);
}

export async function restoreSession(): Promise<void> {
    if (activeKey !== null) return;
    const key = await loadPersistedKey();
    if (key === null) return;
    activeKey = key;
    clearProviderCache();
    notify(true);
}

export function getActiveKey(): DerivedKey | null {
    return activeKey;
}

export function isUnlocked(): boolean {
    return activeKey !== null;
}

export function lockSession(): void {
    activeKey = null;
    clearProviderCache();
    clearPersistedSession();
    notify(false);
}

export async function getProviderConfig(provider: string): Promise<ProviderConfig | null> {
    return loadProviderConfig(activeKey, provider);
}
