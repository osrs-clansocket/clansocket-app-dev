import { PermissionsBitField, type Client } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import type { PendingPublishRow } from "../../../loaders/publish-queue-loader.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";

export async function deleteServerEmoji(client: Client, row: PendingPublishRow): Promise<{ snowflakeResolved: null }> {
    const guild = await client.guilds.fetch(row.guild_id);
    const emoji = orThrow(
        await guild.emojis.fetch(row.target_id_or_temp),
        `server emoji ${row.target_id_or_temp} not found`,
    );
    await emoji.delete();
    return { snowflakeResolved: null };
}

registerPublisher(OP_KINDS.DELETE, ENTITY_TYPES.SERVER_EMOJI, {
    handler: deleteServerEmoji,
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
