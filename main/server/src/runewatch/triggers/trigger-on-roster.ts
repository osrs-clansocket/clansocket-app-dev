import logger from "@clansocket/logger";
import { syncRunewatchCases } from "../sync/sync-cases.js";

export function triggerOnRoster(clanId: string): void {
    syncRunewatchCases({}).catch((err: unknown) => {
        logger.warn(`runewatch.trigger.roster failed clan=${clanId} error=${String(err)}`);
    });
}
