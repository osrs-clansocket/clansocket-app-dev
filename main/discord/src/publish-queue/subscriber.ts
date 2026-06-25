import logger from "@clansocket/logger";
import type { Client } from "discord.js";
import { startSseSubscription } from "../shared/sse-subscription.js";
import { drainPublishQueue } from "./dispatcher.js";

const PUBLISH_EVENT_MARKER = "event: publish";

export function startSubscription(clanId: string, guildId: string, client: Client): () => void {
    return startSseSubscription({
        name: `publish-queue ${clanId}/${guildId}`,
        path: `/api/discord/publish-queue/stream/${clanId}/${guildId}`,
        eventMarker: PUBLISH_EVENT_MARKER,
        onEvent: () => {
            drainPublishQueue(clanId, guildId, client).catch((err: Error) => {
                logger.warn(`Drain failed for ${clanId}/${guildId}: ${err.message}`);
            });
        },
    });
}
