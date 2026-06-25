import type { Guild } from "discord.js";
import { orNull } from "../../shared/nullable.js";
import type { GuildSettingsRow, WelcomeScreenChannel } from "../types.js";

interface WelcomeFetch {
    enabled: boolean;
    description: string | null;
    channels: WelcomeScreenChannel[];
}

function makeWelcome(enabled: boolean, description: string | null, channels: WelcomeScreenChannel[]): WelcomeFetch {
    return { enabled, description, channels };
}

const EMPTY_WELCOME = makeWelcome(false, null, []);

function cachedChannelName(guild: Guild, channelId: string | null): string | null {
    if (!channelId) return null;
    return orNull(guild.channels.cache.get(channelId)?.name);
}

async function fetchWelcomeChannels(guild: Guild): Promise<WelcomeFetch> {
    try {
        const ws = await guild.fetchWelcomeScreen();
        const channels: WelcomeScreenChannel[] = [...ws.welcomeChannels.values()].map((wc) => ({
            channel_id: wc.channelId,
            description: wc.description,
            emoji_id: orNull(wc.emoji?.id),
            emoji_name: orNull(wc.emoji?.name),
        }));
        return makeWelcome(ws.enabled, ws.description, channels);
    } catch {
        return EMPTY_WELCOME;
    }
}

export async function extractSettingsRow(guild: Guild): Promise<GuildSettingsRow> {
    const welcome = await fetchWelcomeChannels(guild);
    return {
        guild_id: guild.id,
        name: guild.name,
        icon_url: guild.iconURL(),
        banner_url: guild.bannerURL(),
        description: guild.description,
        system_channel_id: guild.systemChannelId,
        system_channel_name: cachedChannelName(guild, guild.systemChannelId),
        afk_channel_id: guild.afkChannelId,
        afk_channel_name: cachedChannelName(guild, guild.afkChannelId),
        afk_timeout: guild.afkTimeout,
        verification_level: guild.verificationLevel,
        welcome_screen_enabled: welcome.enabled,
        welcome_screen_description: welcome.description,
        welcome_screen_channels: welcome.channels,
    };
}
