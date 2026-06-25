import { DISCORD_GUILD_DB_PREFIX } from "./db-constants.js";

export function guildDbFile(guildId: string): string {
    return `${DISCORD_GUILD_DB_PREFIX}${guildId}.db`;
}

export function guildDbKey(clanId: string, guildId: string): string {
    return `discord:${clanId}:guild:${guildId}`;
}
