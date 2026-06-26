import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { stickersByGuild } from "../../../database/discord/state/server-stickers/list-server-stickers.js";
import type { ProjectionTopic } from "../projection-types.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function serverStickersTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_SERVER_STICKERS],
        loader: stickersByGuild,
        keyOf: singleKeyOf("sticker_id"),
    });
}
