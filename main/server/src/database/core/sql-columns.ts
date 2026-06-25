export const SQL_COLUMNS = {
    ACCOUNT_HASH: "account_hash",
    SITE_ACCOUNT_ID: "site_account_id",
    ITEM_ID: "item_id",
    ITEM_NAME: "item_name",
    QTY_SIGNED: "qty_signed",
    UNIT_PRICE_GP: "unit_price_gp",
} as const;

export type SqlColumnName = (typeof SQL_COLUMNS)[keyof typeof SQL_COLUMNS];

export const SQL_TABLES = {
    CLANSOCKET_CLANS: "clansocket_clans",
    CLANSOCKET_CLAN_MANAGERS: "clansocket_clan_managers",
    CLANSOCKET_ACCOUNT_BINDINGS: "clansocket_account_bindings",
    CLANSOCKET_NOTIFICATIONS: "clansocket_notifications",
    CLAN_ROSTERS: "clan_rosters",
    DISCORD_CHANNELS: "discord_channels",
    DISCORD_MEMBERS: "discord_members",
    DISCORD_ROLES: "discord_roles",
    DISCORD_SERVER_EMOJIS: "discord_server_emojis",
    DISCORD_SERVER_STICKERS: "discord_server_stickers",
    DISCORD_GUILD_SETTINGS: "discord_guild_settings",
    DISCORD_WEBHOOKS: "discord_webhooks",
    DISCORD_CHANNEL_ROLE_OVERWRITES: "discord_channel_role_overwrites",
    DISCORD_CHANNEL_MEMBER_OVERWRITES: "discord_channel_member_overwrites",
    PLUGIN_CURRENT_STATE: "plugin_current_state",
    PLUGIN_PRAYERS: "plugin_prayers",
} as const;

export type SqlTableName = (typeof SQL_TABLES)[keyof typeof SQL_TABLES];
