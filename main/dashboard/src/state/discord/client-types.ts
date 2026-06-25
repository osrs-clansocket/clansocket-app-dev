export interface DiscordServer {
    guild_id: string;
    guild_name: string;
    bot_id: string;
    bot_name: string | null;
    installed_at: number;
    features: string;
}

export interface DiscordBotIdentity {
    bot_id: string;
    bot_name: string | null;
    application_id: string;
    application_name: string;
    owner_kind: string;
    owner_site_account_id: string | null;
    public_key: string;
    intents_bitfield: number;
    active_presence_template_id: string | null;
}

export interface DiscordChannel extends Record<string, unknown> {
    channel_id: string;
    guild_id: string;
    name: string | null;
    type: number;
    parent_id: string | null;
    position: number | null;
    topic: string | null;
    nsfw: boolean;
    rate_limit_per_user: number | null;
    bitrate: number | null;
    user_limit: number | null;
    thread_archived: boolean | null;
    thread_locked: boolean | null;
    thread_auto_archive_duration: number | null;
    thread_archive_timestamp: number | null;
    thread_message_count: number | null;
}

export interface DiscordChannelPin extends Record<string, unknown> {
    message_id: string;
    channel_id: string;
    guild_id: string;
    author_user_id: string | null;
    author_name: string | null;
    content: string | null;
    timestamp: number;
    attachments: string[];
}

export interface DiscordRole extends Record<string, unknown> {
    role_id: string;
    guild_id: string;
    name: string;
    color: number;
    hoist: boolean;
    mentionable: boolean;
    position: number;
    permissions: string;
    managed: boolean;
    icon_url: string | null;
    unicode_emoji: string | null;
}

export interface DiscordMember extends Record<string, unknown> {
    user_id: string;
    guild_id: string;
    name: string;
    display_name: string | null;
    nickname: string | null;
    joined_at: number | null;
    premium_since: number | null;
    communication_disabled_until: number | null;
    is_boosting: boolean;
    is_bot: boolean;
    role_ids: string[];
    avatar_url: string | null;
    pending: boolean;
    flags: string;
}

export interface DiscordChannelState {
    name: string;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
    parentId?: string | null;
}

export interface DiscordRoleState {
    name: string;
    color: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions: string;
}

export type { DiscordWebhook, DiscordWebhookState } from "./client-types-content.js";
export type {
    DiscordServerEmoji,
    DiscordServerSticker,
    WelcomeScreenChannel,
    DiscordGuildSettings,
    OverwriteRole,
    OverwriteMember,
    DiscordChannelOverwrite,
} from "./client-types-content.js";
