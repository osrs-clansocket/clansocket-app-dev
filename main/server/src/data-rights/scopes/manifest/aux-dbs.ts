import { SQL_COLUMNS, SQL_TABLES } from "../../../database/core/sql-columns.js";
import type { UserTableColumn } from "./types.js";

export const APP_TABLES_BY_ACCOUNT_HASH: readonly UserTableColumn[] = [
    { table: SQL_TABLES.CLANSOCKET_ACCOUNT_BINDINGS, column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: SQL_TABLES.CLANSOCKET_ACCOUNT_RSNS, column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: SQL_TABLES.CLANSOCKET_CLAN_MANAGER_REQUESTS, column: "declared_account_hash" },
    { table: SQL_TABLES.CLANSOCKET_CLANS, column: "owner_account_hash" },
];

export const APP_TABLES_BY_SITE_ACCOUNT: readonly UserTableColumn[] = [
    { table: SQL_TABLES.CLANSOCKET_OAUTH_SESSIONS, column: SQL_COLUMNS.SITE_ACCOUNT_ID, excludeColumns: ["id"] },
    { table: SQL_TABLES.CLANSOCKET_CLAN_MANAGER_REQUESTS, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.CLANSOCKET_CLAN_MANAGERS, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.CLANSOCKET_PASSKEYS, column: SQL_COLUMNS.SITE_ACCOUNT_ID, excludeColumns: ["public_key"] },
    { table: SQL_TABLES.CLANSOCKET_DEVICE_LINK_CODES, column: SQL_COLUMNS.SITE_ACCOUNT_ID, excludeColumns: ["code"] },
    { table: SQL_TABLES.CLANSOCKET_BACKUP_CODES, column: SQL_COLUMNS.SITE_ACCOUNT_ID, excludeColumns: ["code_hash"] },
    { table: SQL_TABLES.CLANSOCKET_ACCOUNT_PROVIDERS, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.CLANSOCKET_DATA_ACTION_LOG, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.CLANSOCKET_NOTIFICATIONS, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.CLANSOCKET_CONSENT_REQUESTS, column: "requesting_site_account_id" },
    { table: SQL_TABLES.CLANSOCKET_CLANS, column: "owner_site_account_id" },
    {
        table: SQL_TABLES.CLANSOCKET_WEBAUTHN_CHALLENGES,
        column: SQL_COLUMNS.SITE_ACCOUNT_ID,
        excludeColumns: ["challenge", "link_code", "backup_code"],
    },
    { table: SQL_TABLES.CLANSOCKET_ACCOUNTS, column: "id" },
];

export const VAREZ_TABLES_BY_SITE_ACCOUNT: readonly UserTableColumn[] = [
    { table: SQL_TABLES.VAREZ_CHAIN_TURNS, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.VAREZ_PINS, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
    { table: SQL_TABLES.VAREZ_USER_ACTION_LOG, column: SQL_COLUMNS.SITE_ACCOUNT_ID },
];

export const DISCORD_BOT_TABLES_BY_SITE_ACCOUNT: readonly UserTableColumn[] = [
    {
        table: SQL_TABLES.DISCORD_BOT_IDENTITIES,
        column: "owner_site_account_id",
        excludeColumns: ["encrypted_token_b64", "token_iv_b64", "token_key_id"],
    },
    { table: SQL_TABLES.DISCORD_BOT_PRESENCE_TEMPLATES, column: "created_by_site_account_id" },
    { table: SQL_TABLES.DISCORD_SERVERS, column: "installer_site_account_id" },
];

export const DISCORD_BOT_TABLES_BY_DISCORD_USER_ID: readonly UserTableColumn[] = [
    { table: SQL_TABLES.DISCORD_INTERACTIONS_PENDING, column: "user_id" },
    { table: SQL_TABLES.DISCORD_SERVERS, column: "remover_user_id" },
];
