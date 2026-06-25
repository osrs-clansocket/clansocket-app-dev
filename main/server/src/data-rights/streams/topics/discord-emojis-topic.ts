import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { emojisByGuild } from "../../../database/discord/state/server-emojis/list-server-emojis.js";
import type { ProjectionTopic } from "../projection.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function serverEmojisTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_SERVER_EMOJIS],
        loader: emojisByGuild,
        keyOf: singleKeyOf("emoji_id"),
    });
}
