import logger from "@clansocket/logger";
import { byoForClan } from "../../../database/discord/byo/byo-identity.js";
import { invalidateToken } from "../../../database/discord/byo/invalidate-token.js";

export async function onByoDeleted(clanId: string): Promise<void> {
    const identity = byoForClan(clanId);
    if (identity) {
        invalidateToken(identity.bot_id);
        logger.info(`[discord-byo] credentials deleted for clan ${clanId}, bot ${identity.bot_id} marked invalidated`);
    } else {
        logger.warn(`[discord-byo] credentials deleted for clan ${clanId}, no identity row found`);
    }
    return Promise.resolve();
}
