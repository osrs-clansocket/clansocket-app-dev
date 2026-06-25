import { getMany } from "../../core/db-ops.js";
import { getDb } from "../../core/database.js";
import { DB_NAMES } from "../../core/db-constants.js";

export interface ServedGuild {
    guild_id: string;
    guild_name: string;
}

const SQL = `SELECT guild_id, guild_name FROM discord_servers
    WHERE bot_id = ? AND removed_at IS NULL
    ORDER BY guild_name`;

export function servedGuildsFor(botId: string): ServedGuild[] {
    return getMany<ServedGuild>(getDb(DB_NAMES.DISCORD_BOT), SQL, botId);
}
