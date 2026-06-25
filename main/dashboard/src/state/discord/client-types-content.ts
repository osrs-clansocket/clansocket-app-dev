export interface DiscordWebhook extends Record<string, unknown> {
    webhook_id: string;
    guild_id: string;
    channel_id: string;
    name: string | null;
    avatar_url: string | null;
    application_id: string | null;
    user_id: string | null;
    webhook_type: number;
    source_guild_id: string | null;
    source_guild_name: string | null;
    source_channel_id: string | null;
    source_channel_name: string | null;
}

export interface DiscordWebhookState {
    name: string | null;
    channelId: string;
    avatarUrl?: string | null;
}

export interface DiscordServerEmoji extends Record<string, unknown> {
    emoji_id: string;
    guild_id: string;
    name: string;
    role_ids: string[];
    animated: boolean;
    available: boolean;
    managed: boolean;
    image_url: string | null;
    user_id: string | null;
}

export interface DiscordServerSticker extends Record<string, unknown> {
    sticker_id: string;
    guild_id: string;
    name: string;
    description: string | null;
    tags: string | null;
    format_type: number;
    available: boolean;
    image_url: string | null;
    user_id: string | null;
}

export interface WelcomeScreenChannel {
    channel_id: string;
    description: string;
    emoji_id: string | null;
    emoji_name: string | null;
}

export interface DiscordGuildSettings extends Record<string, unknown> {
    guild_id: string;
    name: string;
    icon_url: string | null;
    banner_url: string | null;
    description: string | null;
    system_channel_id: string | null;
    afk_channel_id: string | null;
    afk_timeout: number | null;
    verification_level: number;
    welcome_screen_enabled: boolean;
    welcome_screen_description: string | null;
    welcome_screen_channels_json: string;
}

export interface OverwriteRole extends Record<string, unknown> {
    kind: "role";
    channel_id: string;
    role_id: string;
    guild_id: string;
    allow: string;
    deny: string;
}

export interface OverwriteMember extends Record<string, unknown> {
    kind: "member";
    channel_id: string;
    user_id: string;
    guild_id: string;
    allow: string;
    deny: string;
}

export type DiscordChannelOverwrite = OverwriteRole | OverwriteMember;
