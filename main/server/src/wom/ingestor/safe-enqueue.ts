import logger from "@clansocket/logger";
import { enqueueWomRequest, type WomRequestInput } from "../../database/wom/outbound/enqueue.js";

export function safeEnqueueWom(input: WomRequestInput, label: string, scope: string): boolean {
    try {
        enqueueWomRequest(input);
        return true;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`[${scope}] enqueue ${label} skipped for clan ${input.clanId}: ${message}`);
        return false;
    }
}
