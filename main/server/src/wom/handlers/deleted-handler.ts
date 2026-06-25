import logger from "@clansocket/logger";
import { clearIdentity } from "../../database/wom/identity/clear-clan-identity.js";
import { cancelWomDispatcher } from "../dispatcher/dispatcher.js";

export async function onWomDeleted(clanId: string): Promise<void> {
    cancelWomDispatcher(clanId);
    const cleared = clearIdentity(clanId);
    if (cleared) {
        logger.info(`[wom] credentials deleted for clan ${clanId}, identity cleared`);
    } else {
        logger.warn(`[wom] credentials deleted for clan ${clanId}, no identity row found`);
    }
    return Promise.resolve();
}
