import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface UpdateServerEmoji {
    name: string;
    roleIds: readonly string[];
}

export async function applyEmojiUpdate(guild: Guild, emojiId: string, data: UpdateServerEmoji): Promise<void> {
    const emoji = await guild.emojis.fetch(emojiId);
    if (!emoji) throw new Error(`server emoji ${emojiId} not found`);
    await emoji.edit({
        name: data.name,
        roles: [...data.roleIds],
    });
}

registerPublisher("update", "discord_server_emoji", {
    handler: (c, r) =>
        runPublishOp(c, r, "update", (g, d) => applyEmojiUpdate(g, r.target_id_or_temp, d as UpdateServerEmoji)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
