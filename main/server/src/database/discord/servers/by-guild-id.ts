import { getOne } from "../../core/db-ops.js";
import { getDb } from "../../core/database.js";
import { DB_NAMES } from "../../core/db-constants.js";

export interface ServerRoutingRow {
    guild_id: string;
    clan_id: string;
    bot_id: string;
}

const SQL = `SELECT guild_id, clan_id, bot_id FROM discord_servers WHERE guild_id = ?`;

export function byGuildId(guildId: string): ServerRoutingRow | null {
    return getOne<ServerRoutingRow>(getDb(DB_NAMES.DISCORD_BOT), SQL, guildId);
}
