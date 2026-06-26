import { HTTP_METHOD_POST } from "../core/constants.js";
import { apiRequest } from "../fetchers/api-fetcher.js";

const AUTO_BIND_PATH = "/api/discord/state/servers/auto-bind";

export async function autoBindServer(botId: string, guildId: string, guildName: string): Promise<void> {
    await apiRequest<unknown>(HTTP_METHOD_POST, AUTO_BIND_PATH, {
        bot_id: botId,
        guild_id: guildId,
        guild_name: guildName,
    });
}
