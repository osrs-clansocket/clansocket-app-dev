import { selectGuildRows } from "../state/list-guild-rows.js";

interface PermissionRow {
    permission_key: string;
}

const SELECT_SQL = `SELECT permission_key FROM discord_user_permissions WHERE guild_id = ? AND user_id = ? AND revoked_at IS NULL`;

export function listForUser(clanId: string, guildId: string, userId: string): string[] {
    return selectGuildRows<PermissionRow>(clanId, guildId, SELECT_SQL, guildId, userId).map((r) => r.permission_key);
}
