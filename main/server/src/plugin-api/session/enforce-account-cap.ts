import logger from "@clansocket/logger";
import { PLUGIN_MAX_SOCKETS_PER_ACCOUNT, WS_CODE_POLICY_VIOLATION } from "../constants.js";
import type { PluginSocket } from "./socket-state.js";
import { ensureSet } from "./account-socket-registry.js";

export function enforceAccountCap(accountHash: string, ws: PluginSocket): void {
    const set = ensureSet(accountHash);
    set.add(ws);
    while (set.size > PLUGIN_MAX_SOCKETS_PER_ACCOUNT) {
        const oldest = set.values().next().value as PluginSocket | undefined;
        if (!oldest || oldest === ws) break;
        set.delete(oldest);
        try {
            oldest.close(WS_CODE_POLICY_VIOLATION, "account connection cap");
        } catch (err) {
            logger.debug(`[account-cap] graceful close failed accountHash=${accountHash}: ${(err as Error).message}`);
            oldest.terminate();
        }
    }
}
