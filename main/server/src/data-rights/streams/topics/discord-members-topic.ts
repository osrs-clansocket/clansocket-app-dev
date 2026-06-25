import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { listMembersGuild } from "../../../database/discord/state/members/list-members.js";
import type { ProjectionTopic } from "../projection.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function discordMembersTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_MEMBERS],
        loader: listMembersGuild,
        keyOf: singleKeyOf("user_id"),
    });
}
