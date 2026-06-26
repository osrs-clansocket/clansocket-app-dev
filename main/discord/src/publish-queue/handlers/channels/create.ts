import { PermissionsBitField, type Guild, type GuildChannelCreateOptions } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface ChannelCreateState {
    name: string;
    channelType: number;
    topic: string | null;
    nsfw: boolean;
    rateLimitPerUser: number;
    parentId: string | null;
}

export async function applyChannelCreate(guild: Guild, data: ChannelCreateState): Promise<string> {
    const opts: GuildChannelCreateOptions = {
        name: data.name,
        type: data.channelType as GuildChannelCreateOptions["type"],
        topic: data.topic ?? undefined,
        nsfw: data.nsfw,
        rateLimitPerUser: data.rateLimitPerUser,
        parent: data.parentId ?? undefined,
    };
    const channel = await guild.channels.create(opts);
    return channel.id;
}

registerPublisher(OP_KINDS.CREATE, ENTITY_TYPES.CHANNEL, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.CREATE, (g, d) => applyChannelCreate(g, d as ChannelCreateState)),
    requiredBotPermission: PermissionsBitField.Flags.ManageChannels,
});
