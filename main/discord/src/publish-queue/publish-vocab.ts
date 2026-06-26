export const OP_KINDS = Object.freeze({
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
});

export const ENTITY_TYPES = Object.freeze({
    CHANNEL: "discord_channel",
    GUILD_SETTINGS: "discord_guild_settings",
    MEMBER: "discord_member",
    ROLE: "discord_role",
    SERVER_EMOJI: "discord_server_emoji",
    SERVER_STICKER: "discord_server_sticker",
    WEBHOOK: "discord_webhook",
});
