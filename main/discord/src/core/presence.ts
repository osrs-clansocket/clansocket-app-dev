import logger from "@clansocket/logger";
import type { Client } from "discord.js";
import { loadPresence } from "../loaders/presence-loader.js";
import type { BotIdentity } from "../shared/types/bot-types.js";
import { buildActivity } from "./presence/builders.js";

const DEFAULT_ACTIVITY_TYPE = 3;
const DEFAULT_ACTIVITY_NAME = "ClanSocket";
const DEFAULT_STATUS = "online";
const AFK_TRUE = 1;

type PresenceStatus = "online" | "idle" | "dnd" | "invisible";

async function applyPresence(client: Client, identity: BotIdentity): Promise<void> {
    try {
        const template = await loadPresence(identity.bot_id);
        const status = (template?.status ?? DEFAULT_STATUS) as PresenceStatus;
        const activity = template
            ? buildActivity(template)
            : { name: DEFAULT_ACTIVITY_NAME, type: DEFAULT_ACTIVITY_TYPE };
        const presence: Record<string, unknown> = { status, activities: [activity] };
        if (template?.afk === AFK_TRUE) presence.afk = true;
        if (template?.since_ms) presence.since = template.since_ms;
        client.user!.setPresence(presence as never);
    } catch (err: any) {
        logger.warn(`Presence update failed for ${identity.bot_id}: ${err}`);
    }
}

export { applyPresence };
