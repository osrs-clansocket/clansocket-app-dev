import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { listChannelsGuild } from "../../../database/discord/state/channels/list-channels.js";
import type { ProjectionTopic } from "../projection-types.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function discordChannelsTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_CHANNELS],
        loader: listChannelsGuild,
        keyOf: singleKeyOf("channel_id"),
    });
}
