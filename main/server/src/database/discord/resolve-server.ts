import { getOne } from "../core/db-ops.js";
import { getDb } from "../core/database.js";
import { DB_NAMES } from "../core/db-constants.js";
import type { RoutedServerRow } from "./types.js";

const SELECT_SQL = `SELECT guild_id, guild_name, clan_id, clan_name, bot_id, bot_name, setup_status FROM discord_servers WHERE guild_id = ? AND removed_at IS NULL`;

export function serverByGuild(guildId: string): RoutedServerRow | null {
    return getOne<RoutedServerRow>(getDb(DB_NAMES.DISCORD_BOT), SELECT_SQL, guildId);
}
