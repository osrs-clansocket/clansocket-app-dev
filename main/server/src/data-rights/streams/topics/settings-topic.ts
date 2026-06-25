import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { getGuildSettings } from "../../../database/discord/state/guild-settings/get-guild-settings.js";
import type { ProjectionTopic } from "../projection.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function guildSettingsTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_GUILD_SETTINGS],
        loader: (cId, gId) => {
            const row = getGuildSettings(cId, gId);
            return row ? [row] : [];
        },
        keyOf: singleKeyOf("guild_id"),
    });
}
