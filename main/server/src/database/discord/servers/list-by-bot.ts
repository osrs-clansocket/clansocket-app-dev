import { DB_NAMES } from "../../core/db-constants.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";

export interface BotServerRow {
    guild_id: string;
    guild_name: string;
    clan_id: string;
    clan_name: string;
}

export function listByBot(botId: string): BotServerRow[] {
    return selectRows<BotServerRow>(
        DB_NAMES.DISCORD_BOT,
        `SELECT guild_id, guild_name, clan_id, clan_name FROM discord_servers WHERE bot_id = ? AND removed_at IS NULL`,
        botId,
    );
}
