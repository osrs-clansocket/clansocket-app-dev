import { PermissionsBitField, type Client } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import type { PendingPublishRow } from "../../../loaders/publish-queue-loader.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";

export async function deleteChannelHandler(
    client: Client,
    row: PendingPublishRow,
): Promise<{ snowflakeResolved: null }> {
    const guild = await client.guilds.fetch(row.guild_id);
    const channel = orThrow(
        await guild.channels.fetch(row.target_id_or_temp),
        `channel ${row.target_id_or_temp} not found`,
    );
    await channel.delete();
    return { snowflakeResolved: null };
}

registerPublisher(OP_KINDS.DELETE, ENTITY_TYPES.CHANNEL, {
    handler: deleteChannelHandler,
    requiredBotPermission: PermissionsBitField.Flags.ManageChannels,
});
