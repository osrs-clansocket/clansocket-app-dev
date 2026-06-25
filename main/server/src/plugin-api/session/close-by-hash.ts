import logger from "@clansocket/logger";
import { WS_CODE_POLICY_VIOLATION } from "../constants.js";
import type { PluginSocket } from "./socket-state.js";
import { socketsForAccount } from "./account-socket-registry.js";

export function closeByHash(accountHash: string): number {
    const set = socketsForAccount(accountHash);
    if (!set) return 0;
    let n = 0;
    for (const ws of [...set] as PluginSocket[]) {
        try {
            ws.close(WS_CODE_POLICY_VIOLATION, "data wiped");
        } catch (err) {
            logger.debug(
                `[account-cap] graceful close failed (data wipe) accountHash=${accountHash}: ${(err as Error).message}`,
            );
            ws.terminate();
        }
        n += 1;
    }
    return n;
}
