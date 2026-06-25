import { PermissionsBitField, type Client } from "discord.js";
import type { PendingPublishRow } from "../../../loaders/publish-queue-loader.js";
import { registerPublisher } from "../../publisher-registry.js";

export async function deleteChannelHandler(
    client: Client,
    row: PendingPublishRow,
): Promise<{ snowflakeResolved: null }> {
    const guild = await client.guilds.fetch(row.guild_id);
    const channel = await guild.channels.fetch(row.target_id_or_temp);
    if (!channel) throw new Error(`channel ${row.target_id_or_temp} not found`);
    await channel.delete();
    return { snowflakeResolved: null };
}

registerPublisher("delete", "discord_channel", {
    handler: deleteChannelHandler,
    requiredBotPermission: PermissionsBitField.Flags.ManageChannels,
});
