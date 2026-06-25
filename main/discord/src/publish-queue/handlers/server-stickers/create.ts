import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
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

registerPublisher("create", "discord_server_sticker", {
    handler: (c, r) => runPublishOp(c, r, "create", (g, d) => applyStickerCreate(g, d as CreateServerSticker)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
