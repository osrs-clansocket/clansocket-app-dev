import { PermissionsBitField, type Guild } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface UpdateServerEmoji {
    name: string;
    roleIds: readonly string[];
}

export async function applyEmojiUpdate(guild: Guild, emojiId: string, data: UpdateServerEmoji): Promise<void> {
    const emoji = orThrow(await guild.emojis.fetch(emojiId), `server emoji ${emojiId} not found`);
    await emoji.edit({
        name: data.name,
        roles: [...data.roleIds],
    });
}

registerPublisher(OP_KINDS.UPDATE, ENTITY_TYPES.SERVER_EMOJI, {
    handler: (c, r) =>
        runPublishOp(c, r, OP_KINDS.UPDATE, (g, d) => applyEmojiUpdate(g, r.target_id_or_temp, d as UpdateServerEmoji)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
