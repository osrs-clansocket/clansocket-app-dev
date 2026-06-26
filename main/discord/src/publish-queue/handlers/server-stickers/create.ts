import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface CreateServerSticker {
    name: string;
    imageDataUrl: string;
    description: string | null;
    tags: string | null;
    formatType: number;
}

export async function applyStickerCreate(guild: Guild, data: CreateServerSticker): Promise<string> {
    const sticker = await guild.stickers.create({
        name: data.name,
        file: data.imageDataUrl,
        description: data.description ?? undefined,
        tags: data.tags ?? data.name,
    });
    return sticker.id;
}

export type { CreateServerSticker };

registerPublisher(OP_KINDS.CREATE, ENTITY_TYPES.SERVER_STICKER, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.CREATE, (g, d) => applyStickerCreate(g, d as CreateServerSticker)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
