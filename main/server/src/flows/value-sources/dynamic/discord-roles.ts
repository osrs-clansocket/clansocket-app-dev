import { registerValueSource } from "../../registries/value-source-registry.js";
import { queryAcrossGuilds } from "./multi-guild-query.js";

interface RoleRow {
    role_id: string;
    name: string;
}

registerValueSource({
    format: "discord-role-id",
    label: "Discord roles",
    fetch: (clanId) =>
        queryAcrossGuilds<RoleRow>(clanId, {
            sql: "SELECT role_id, name FROM discord_roles WHERE managed = 0 ORDER BY position DESC",
            mapRow: (row) => ({ id: row.role_id, name: row.name }),
        }),
});
