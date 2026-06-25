import logger from "@clansocket/logger";
import { WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { eachClient } from "../transport/wss-registry.js";

export function closeByClan(clanId: string): number {
    let n = 0;
    eachClient((ws) => {
        if (ws.pluginState?.sockClanId !== clanId) return;
        try {
            ws.close(WS_CODE_POLICY_VIOLATION, "clan deleted");
        } catch (err) {
            logger.debug(
                `[account-cap] graceful close failed (clan deleted) clanId=${clanId}: ${(err as Error).message}`,
            );
            ws.terminate();
        }
        n += 1;
    });
    return n;
}
