import type { Client } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { registerSender } from "../sender-registry.js";

export const KIND_LEAVE_GUILD = "leave_guild";

export async function senderLeaveGuild(client: Client, event: PendingOutboundRow): Promise<string | null> {
    const guild = await client.guilds.fetch(event.guild_id);
    if (guild) await guild.leave();
    return null;
}

registerSender(KIND_LEAVE_GUILD, senderLeaveGuild);
