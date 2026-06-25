import type { UserTableColumn } from "./types.js";

export const APP_TABLES_BY_ACCOUNT_HASH: readonly UserTableColumn[] = [
    { table: "clansocket_account_bindings", column: "account_hash" },
    { table: "clansocket_account_rsns", column: "account_hash" },
    { table: "clansocket_clan_manager_requests", column: "declared_account_hash" },
    { table: "clansocket_clans", column: "owner_account_hash" },
];

export const APP_TABLES_BY_SITE_ACCOUNT: readonly UserTableColumn[] = [
    { table: "clansocket_oauth_sessions", column: "site_account_id", excludeColumns: ["id"] },
    { table: "clansocket_clan_manager_requests", column: "site_account_id" },
    { table: "clansocket_clan_managers", column: "site_account_id" },
    { table: "clansocket_passkeys", column: "site_account_id", excludeColumns: ["public_key"] },
    { table: "clansocket_device_link_codes", column: "site_account_id", excludeColumns: ["code"] },
    { table: "clansocket_backup_codes", column: "site_account_id", excludeColumns: ["code_hash"] },
    { table: "clansocket_account_providers", column: "site_account_id" },
    { table: "clansocket_data_action_log", column: "site_account_id" },
    { table: "clansocket_notifications", column: "site_account_id" },
    { table: "clansocket_consent_requests", column: "requesting_site_account_id" },
    { table: "clansocket_clans", column: "owner_site_account_id" },
    {
        table: "clansocket_webauthn_challenges",
        column: "site_account_id",
        excludeColumns: ["challenge", "link_code", "backup_code"],
    },
    { table: "clansocket_accounts", column: "id" },
];

export const VAREZ_TABLES_BY_SITE_ACCOUNT: readonly UserTableColumn[] = [
    { table: "varez_chain_turns", column: "site_account_id" },
    { table: "varez_pins", column: "site_account_id" },
    { table: "varez_user_action_log", column: "site_account_id" },
];

export const DISCORD_BOT_TABLES_BY_SITE_ACCOUNT: readonly UserTableColumn[] = [
    {
        table: "discord_bot_identities",
        column: "owner_site_account_id",
        excludeColumns: ["encrypted_token_b64", "token_iv_b64", "token_key_id"],
    },
    { table: "discord_bot_presence_templates", column: "created_by_site_account_id" },
    { table: "discord_servers", column: "installer_site_account_id" },
];

export const DISCORD_BOT_TABLES_BY_DISCORD_USER_ID: readonly UserTableColumn[] = [
    { table: "discord_interactions_pending", column: "user_id" },
    { table: "discord_servers", column: "remover_user_id" },
];
