import type { PluginSocket } from "./socket-state.js";

const socketsByAccount = new Map<string, Set<PluginSocket>>();

export function ensureSet(accountHash: string): Set<PluginSocket> {
    let set = socketsByAccount.get(accountHash);
    if (!set) {
        set = new Set();
        socketsByAccount.set(accountHash, set);
    }
    return set;
}

export function socketsForAccount(accountHash: string): Set<PluginSocket> | undefined {
    return socketsByAccount.get(accountHash);
}

export function removeFromAccount(accountHash: string, ws: PluginSocket): void {
    const set = socketsByAccount.get(accountHash);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) socketsByAccount.delete(accountHash);
}

export function clearAllAccounts(): void {
    socketsByAccount.clear();
}
