import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { listRolesGuild } from "../../../database/discord/state/roles/list-roles.js";
import type { ProjectionTopic } from "../projection-types.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function discordRolesTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_ROLES],
        loader: listRolesGuild,
        keyOf: singleKeyOf("role_id"),
    });
}
