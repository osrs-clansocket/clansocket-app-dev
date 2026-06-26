import logger from "@clansocket/logger";
import { loadMasterKey } from "./crypto/vault-key-loader.js";

export function loadMaster(): void {
    try {
        loadMasterKey();
        logger.info("clan vault master key loaded");
    } catch (e) {
        logger.warn(
            `[clan-vault] master key not loaded: ${(e as Error).message}. vault ops will fail until CLANSOCKET_CLAN_VAULT_MASTER_KEY is set.`,
        );
    }
}
