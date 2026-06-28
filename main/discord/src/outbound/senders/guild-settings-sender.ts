import type { Client, Guild, GuildVerificationLevel } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { registerSender } from "../sender-registry.js";

export const KIND_GUILD_SETTINGS = "guild_settings";

interface GuildSettingsPayload {
    setting_key: string;
    name?: string;
    icon_url?: string;
    banner_url?: string;
    description?: string;
    system_channel_id?: string | null;
    afk_channel_id?: string | null;
    afk_timeout?: number;
    verification_level?: number;
    reason?: string;
}

function parsePayload(json: string): GuildSettingsPayload {
    return JSON.parse(json) as GuildSettingsPayload;
}

async function fetchGuild(client: Client, guildId: string): Promise<Guild> {
    return client.guilds.fetch(guildId);
}

async function setName(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    if (typeof p.name !== "string") throw new Error("guild_settings.set-name requires name");
    await guild.setName(p.name, p.reason);
    return guildId;
}

async function setIcon(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    if (typeof p.icon_url !== "string") throw new Error("guild_settings.set-icon requires icon_url");
    await guild.setIcon(p.icon_url, p.reason);
    return guildId;
}

async function setBanner(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    if (typeof p.banner_url !== "string") throw new Error("guild_settings.set-banner requires banner_url");
    await guild.setBanner(p.banner_url, p.reason);
    return guildId;
}

async function setDescription(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    const desc = typeof p.description === "string" ? p.description : null;
    await (guild as { edit: (opts: Record<string, unknown>, reason?: string) => Promise<unknown> }).edit(
        { description: desc },
        p.reason,
    );
    return guildId;
}

async function setSystemChannel(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    const channelId = typeof p.system_channel_id === "string" ? p.system_channel_id : null;
    await guild.setSystemChannel(channelId, p.reason);
    return guildId;
}

async function setAfkChannel(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    const channelId = typeof p.afk_channel_id === "string" ? p.afk_channel_id : null;
    await guild.setAFKChannel(channelId, p.reason);
    if (typeof p.afk_timeout === "number") await guild.setAFKTimeout(p.afk_timeout, p.reason);
    return guildId;
}

async function setVerificationLevel(client: Client, p: GuildSettingsPayload, guildId: string): Promise<string | null> {
    const guild = await fetchGuild(client, guildId);
    if (typeof p.verification_level !== "number") {
        throw new Error("guild_settings.set-verification-level requires verification_level");
    }
    await guild.setVerificationLevel(p.verification_level as GuildVerificationLevel, p.reason);
    return guildId;
}

const ACTION_HANDLERS: Record<
    string,
    (client: Client, p: GuildSettingsPayload, guildId: string) => Promise<string | null>
> = {
    "set-name": setName,
    "set-icon": setIcon,
    "set-banner": setBanner,
    "set-description": setDescription,
    "set-system-channel": setSystemChannel,
    "set-afk-channel": setAfkChannel,
    "set-verification-level": setVerificationLevel,
};

export async function senderGuildSettings(client: Client, event: PendingOutboundRow): Promise<string | null> {
    if (!event.target_id) throw new Error("guild_settings requires target_id (guild id)");
    const payload = parsePayload(event.payload_json);
    const handler = ACTION_HANDLERS[payload.setting_key];
    if (!handler) throw new Error(`unknown guild_settings.setting_key: ${payload.setting_key}`);
    return handler(client, payload, event.target_id);
}

registerSender(KIND_GUILD_SETTINGS, senderGuildSettings);
