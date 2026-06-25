import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface UpdateServerSticker {
    name: string;
    description: string | null;
    tags: string | null;
}

export async function applyStickerUpdate(guild: Guild, stickerId: string, data: UpdateServerSticker): Promise<void> {
    const sticker = await guild.stickers.fetch(stickerId);
    if (!sticker) throw new Error(`server sticker ${stickerId} not found`);
    await sticker.edit({
        name: data.name,
        description: data.description ?? undefined,
        tags: data.tags ?? undefined,
    });
}

registerPublisher("update", "discord_server_sticker", {
    handler: (c, r) =>
        runPublishOp(c, r, "update", (g, d) => applyStickerUpdate(g, r.target_id_or_temp, d as UpdateServerSticker)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
