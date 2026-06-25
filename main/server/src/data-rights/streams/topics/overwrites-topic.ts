import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { overwritesByGuild } from "../../../database/discord/state/channel-overwrites/list-overwrites.js";
import type { ProjectionTopic } from "../projection.js";
import { guildTopic } from "./guild-topic-builder.js";

const TABLES = [SQL_TABLES.DISCORD_CHANNEL_ROLE_OVERWRITES, SQL_TABLES.DISCORD_CHANNEL_MEMBER_OVERWRITES] as const;

export function channelOverwritesTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: TABLES,
        loader: overwritesByGuild,
        keyOf: (row) =>
            `${String(row.kind)}:${String(row.channel_id)}:${row.kind === "role" ? String(row.role_id) : String(row.user_id)}`,
    });
}
