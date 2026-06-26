import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface CreateServerEmoji {
    name: string;
    imageDataUrl: string;
    roleIds: readonly string[];
}

export async function applyEmojiCreate(guild: Guild, data: CreateServerEmoji): Promise<string> {
    const emoji = await guild.emojis.create({
        name: data.name,
        attachment: data.imageDataUrl,
        roles: data.roleIds.length > 0 ? [...data.roleIds] : undefined,
    });
    return emoji.id;
}

export type { CreateServerEmoji };

registerPublisher(OP_KINDS.CREATE, ENTITY_TYPES.SERVER_EMOJI, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.CREATE, (g, d) => applyEmojiCreate(g, d as CreateServerEmoji)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
