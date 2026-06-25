import { DB_NAMES } from "../../core/db-constants.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";

interface GuildRoutingRow {
    guild_id: string;
}

export function listBotGuilds(clanId: string, botId: string): string[] {
    return selectRows<GuildRoutingRow>(
        DB_NAMES.DISCORD_BOT,
        `SELECT guild_id FROM discord_servers WHERE clan_id = ? AND bot_id = ?`,
        clanId,
        botId,
    ).map((r) => r.guild_id);
}
