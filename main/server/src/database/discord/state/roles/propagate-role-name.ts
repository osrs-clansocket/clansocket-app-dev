import { runGuildSql } from "../../discord.js";

export function propagateRoleName(clanId: string, guildId: string, roleId: string, newName: string | null): void {
    runGuildSql(
        clanId,
        guildId,
        `UPDATE discord_channel_role_overwrites SET role_name = ? WHERE role_id = ?`,
        newName,
        roleId,
    );
}
