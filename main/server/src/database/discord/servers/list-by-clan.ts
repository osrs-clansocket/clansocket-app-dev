import { getMany } from "../../core/db-ops.js";
import { getDb } from "../../core/database.js";
import { DB_NAMES } from "../../core/db-constants.js";

export interface ClanServerRow {
    guild_id: string;
    guild_name: string;
    bot_id: string;
    bot_name: string;
    installed_at: number;
    features: string;
}

const SQL = `SELECT guild_id, guild_name, bot_id, bot_name, installed_at, features FROM discord_servers WHERE clan_id = ? AND removed_at IS NULL ORDER BY installed_at ASC`;

export function listByClan(clanId: string): ClanServerRow[] {
    return getMany<ClanServerRow>(getDb(DB_NAMES.DISCORD_BOT), SQL, clanId);
}
