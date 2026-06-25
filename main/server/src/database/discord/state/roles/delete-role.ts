import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_roles WHERE role_id = ?`;

export function deleteRole(clanId: string, guildId: string, roleId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, roleId);
}
