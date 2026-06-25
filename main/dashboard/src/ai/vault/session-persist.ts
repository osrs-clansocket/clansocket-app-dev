import { del, get, set } from "idb-keyval";
import type { DerivedKey } from "./crypto";

const IDB_SESSION_KEY = "aiVaultSessionKey";
const IDB_SESSION_TOKEN = "aiVaultSessionToken";
const SS_SESSION_TOKEN = "aiVaultSession";

export function persistSession(key: DerivedKey): void {
    const token = crypto.randomUUID();
    sessionStorage.setItem(SS_SESSION_TOKEN, token);
    void set(IDB_SESSION_TOKEN, token);
    void set(IDB_SESSION_KEY, key.key);
}

export function clearPersistedSession(): void {
    sessionStorage.removeItem(SS_SESSION_TOKEN);
    void del(IDB_SESSION_TOKEN);
    void del(IDB_SESSION_KEY);
}

export async function loadPersistedKey(): Promise<DerivedKey | null> {
    const token = sessionStorage.getItem(SS_SESSION_TOKEN);
    if (token === null) return null;
    const storedToken = await get<string>(IDB_SESSION_TOKEN);
    if (storedToken !== token) return null;
    const cryptoKey = await get<CryptoKey>(IDB_SESSION_KEY);
    if (cryptoKey === undefined) return null;
    return { key: cryptoKey };
}
