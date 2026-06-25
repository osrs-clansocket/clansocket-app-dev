export const DISCORD_CLIENT_MODULE = "discord-client" as const;
export type {
    DiscordServer,
    DiscordBotIdentity,
    DiscordChannel,
    DiscordChannelPin,
    DiscordRole,
    DiscordMember,
    DiscordWebhook,
    DiscordWebhookState,
    DiscordServerEmoji,
    DiscordServerSticker,
    WelcomeScreenChannel,
    DiscordGuildSettings,
    OverwriteRole,
    OverwriteMember,
    DiscordChannelOverwrite,
    DiscordChannelState,
    DiscordRoleState,
} from "./client-types.js";

export {
    openServersStream,
    openChannelsStream,
    openRolesStream,
    openMembersStream,
    openWebhooksStream,
    openEmojisStream,
    openStickersStream,
    openSettingsStream,
    openOverwritesStream,
} from "./client-streams.js";

export {
    createDiscordChannel,
    deleteDiscordChannel,
    updateDiscordChannel,
    fetchChannelPins,
    removeDiscordServer,
    type CreateChannelPayload,
    type CreateChannelResult,
    type DeleteChannelPayload,
    type UpdateChannelPayload,
} from "./client-channels.js";

export {
    createDiscordRole,
    deleteDiscordRole,
    updateDiscordRole,
    type CreateRolePayload,
    type DeleteRolePayload,
    type UpdateRolePayload,
} from "./client-roles.js";

export {
    setMemberNickname,
    kickDiscordMember,
    type SetNicknamePayload,
    type KickMemberPayload,
} from "./client-members.js";

export {
    createDiscordWebhook,
    updateDiscordWebhook,
    deleteDiscordWebhook,
    type CreateWebhookPayload,
    type UpdateWebhookPayload,
    type DeleteWebhookPayload,
} from "./client-webhooks.js";

export {
    createServerEmoji,
    updateServerEmoji,
    deleteServerEmoji,
    createServerSticker,
    updateServerSticker,
    deleteServerSticker,
    type CreateEmoji,
    type UpdateEmoji,
    type DeleteEmoji,
    type CreateSticker,
    type UpdateSticker,
    type DeleteSticker,
} from "./client-emojis-stickers.js";

export {
    setGuildName,
    setGuildIcon,
    setGuildBanner,
    setGuildDescription,
    setSystemChannel,
    setGuildAfk,
    setVerificationLevel,
    setWelcomeScreen,
    setChannelPermissions,
    deleteChannelPermissions,
    type SetGuildName,
    type SetGuildIcon,
    type SetGuildBanner,
    type SetGuildDescription,
    type SetSystemChannel,
    type SetGuildAfk,
    type SetVerificationLevel,
    type SetWelcomeScreen,
    type SetChannelPermissions,
    type DeleteChannelPermissions,
} from "./client-settings.js";
