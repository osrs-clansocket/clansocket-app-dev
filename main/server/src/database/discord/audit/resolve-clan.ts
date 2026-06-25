import { DB_NAMES } from "../../core/db-constants.js";
import { selectColumn } from "../../core/operations.js";

export function resolveClanId(guildId: string): string | null {
    return selectColumn<string>(
        DB_NAMES.DISCORD_BOT,
        `SELECT clan_id FROM discord_servers WHERE guild_id = ? AND removed_at IS NULL`,
        guildId,
    );
}
