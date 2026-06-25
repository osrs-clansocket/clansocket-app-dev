import logger from "@clansocket/logger";
import { discordGuildDb } from "../../core/database.js";

export interface SetPermissionsParams {
    clanId: string;
    guildId: string;
    userId: string;
    permissions: string[];
    grantedBySiteAccountId: string;
    grantedBySiteAccountName: string | null;
}

const REVOKE_SQL = `UPDATE discord_user_permissions SET revoked_at = ? WHERE guild_id = ? AND user_id = ? AND revoked_at IS NULL`;
const INSERT_SQL = `INSERT OR REPLACE INTO discord_user_permissions (guild_id, user_id, permission_key, granted_at, granted_by_site_account_id, granted_by_site_account_name, revoked_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`;

export function setForUser(params: SetPermissionsParams): void {
    const db = discordGuildDb(params.clanId, params.guildId);
    const now = Date.now();
    const revoke = db.prepare(REVOKE_SQL);
    const insert = db.prepare(INSERT_SQL);
    db.transaction(() => {
        logger.debug(
            `[user-permissions] setForUser guildId=${params.guildId} userId=${params.userId} keys=${params.permissions.length}`,
        );
        revoke.run(now, params.guildId, params.userId);
        for (const key of params.permissions) {
            insert.run(
                params.guildId,
                params.userId,
                key,
                now,
                params.grantedBySiteAccountId,
                params.grantedBySiteAccountName,
                now,
            );
        }
    })();
}
