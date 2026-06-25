import logger from "@clansocket/logger";
import { syncRunewatchCases } from "../sync/sync-cases.js";

export function triggerVerifyRunewatch(): void {
    syncRunewatchCases({}).catch((err: unknown) => {
        logger.warn(`runewatch.trigger.verify failed error=${String(err)}`);
    });
}
