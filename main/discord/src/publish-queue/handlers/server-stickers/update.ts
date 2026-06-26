import { PermissionsBitField, type Guild } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface UpdateServerSticker {
    name: string;
    description: string | null;
    tags: string | null;
}

export async function applyStickerUpdate(guild: Guild, stickerId: string, data: UpdateServerSticker): Promise<void> {
    const sticker = orThrow(await guild.stickers.fetch(stickerId), `server sticker ${stickerId} not found`);
    await sticker.edit({
        name: data.name,
        description: data.description ?? undefined,
        tags: data.tags ?? undefined,
    });
}

registerPublisher(OP_KINDS.UPDATE, ENTITY_TYPES.SERVER_STICKER, {
    handler: (c, r) =>
        runPublishOp(c, r, OP_KINDS.UPDATE, (g, d) =>
            applyStickerUpdate(g, r.target_id_or_temp, d as UpdateServerSticker),
        ),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuildExpressions,
});
