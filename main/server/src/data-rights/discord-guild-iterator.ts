import { DB_NAMES } from "../database/core/db-constants.js";
import { selectRows } from "../shared/loaders/db-rows.js";

export function guildIdsOf(clanId: string): string[] {
    return selectRows<{ guild_id: string }>(
        DB_NAMES.DISCORD_BOT,
        `SELECT guild_id FROM discord_servers WHERE clan_id = ? AND removed_at IS NULL`,
        clanId,
    ).map((r) => r.guild_id);
}
