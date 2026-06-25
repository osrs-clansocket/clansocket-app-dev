import { discordGuildDb } from "../../discord.js";
import type { GuildSettingsRow } from "../types.js";
import { propagateGuildName } from "./propagate-guild-name.js";

const UPSERT_SQL = `
INSERT INTO discord_guild_settings (
    guild_id, name, icon_url, banner_url, description,
    system_channel_id, system_channel_name, afk_channel_id, afk_channel_name, afk_timeout, verification_level,
    welcome_screen_enabled, welcome_screen_description, welcome_screen_channels_json, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(guild_id) DO UPDATE SET
    name = excluded.name,
    icon_url = excluded.icon_url,
    banner_url = excluded.banner_url,
    description = excluded.description,
    system_channel_id = excluded.system_channel_id,
    system_channel_name = excluded.system_channel_name,
    afk_channel_id = excluded.afk_channel_id,
    afk_channel_name = excluded.afk_channel_name,
    afk_timeout = excluded.afk_timeout,
    verification_level = excluded.verification_level,
    welcome_screen_enabled = excluded.welcome_screen_enabled,
    welcome_screen_description = excluded.welcome_screen_description,
    welcome_screen_channels_json = excluded.welcome_screen_channels_json,
    updated_at = excluded.updated_at
`;

const FLAG_TRUE = 1;
const FLAG_FALSE = 0;

export function upsertGuildSettings(clanId: string, guildId: string, row: GuildSettingsRow): void {
    const db = discordGuildDb(clanId, guildId);
    db.prepare(UPSERT_SQL).run(
        row.guild_id,
        row.name,
        row.icon_url,
        row.banner_url,
        row.description,
        row.system_channel_id,
        row.system_channel_name,
        row.afk_channel_id,
        row.afk_channel_name,
        row.afk_timeout,
        row.verification_level,
        row.welcome_screen_enabled ? FLAG_TRUE : FLAG_FALSE,
        row.welcome_screen_description,
        JSON.stringify(row.welcome_screen_channels),
        Date.now(),
    );
    propagateGuildName(clanId, guildId, row.name);
}
