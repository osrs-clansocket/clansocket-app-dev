import { clearAllAccounts, removeFromAccount } from "./account-socket-registry.js";
import type { PluginSocket } from "./socket-state.js";

export { closeByClan } from "./close-by-clan.js";
export { closeByHash } from "./close-by-hash.js";
export { enforceAccountCap } from "./enforce-account-cap.js";

export function unregisterSocket(accountHash: string, ws: PluginSocket): void {
    removeFromAccount(accountHash, ws);
}

export function clearAccountRegistry(): void {
    clearAllAccounts();
}
