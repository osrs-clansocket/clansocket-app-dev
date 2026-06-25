import logger from "@clansocket/logger";
import { startSseSubscription } from "../shared/sse-subscription.js";

const BOTS_EVENT_MARKER = "event: bots";

export function startBotsWatcher(onBotsEvent: () => Promise<void>): () => void {
    return startSseSubscription({
        name: "bots",
        path: "/api/discord/bots/stream",
        eventMarker: BOTS_EVENT_MARKER,
        onEvent: () => {
            onBotsEvent().catch((err: Error) => {
                logger.warn(`Bot reconcile failed: ${err.message}`);
            });
        },
    });
}
