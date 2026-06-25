import { SQL_COLUMNS } from "../../../database/core/sql-columns.js";
import type { ChildTable, ScopedUserTable } from "./types.js";

export const CLAN_DB_USER_TABLES: readonly ScopedUserTable[] = [
    { table: "clan_accounts", column: SQL_COLUMNS.ACCOUNT_HASH, action: "delete" },
    { table: "clan_rosters", column: "captured_by_account_hash", action: "null" },
    { table: "clan_chats", column: SQL_COLUMNS.ACCOUNT_HASH, action: "delete" },
    { table: "clan_member_history", column: SQL_COLUMNS.ACCOUNT_HASH, action: "delete" },
    { table: "clan_snapshots", column: SQL_COLUMNS.ACCOUNT_HASH, action: "delete" },
    { table: "clan_titles_current", column: SQL_COLUMNS.ACCOUNT_HASH, action: "delete" },
    { table: "clan_titles_history", column: SQL_COLUMNS.ACCOUNT_HASH, action: "delete" },
];

export const CLAN_DB_SITE_ACCOUNT_TABLES: readonly ScopedUserTable[] = [];

export const CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES: readonly ScopedUserTable[] = [
    { table: "clan_audit_log", column: "actor_site_account_id", action: "null" },
];

export const DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES: readonly ScopedUserTable[] = [
    { table: "discord_draft_sessions", column: "owner_site_account_id", action: "delete" },
    {
        table: "discord_webhook_tokens",
        column: "bound_by_site_account_id",
        action: "delete",
        excludeColumns: ["encrypted_token_b64", "token_iv_b64", "token_key_id"],
    },
];

export const DISCORD_GUILD_CHILD_TABLES: readonly ChildTable[] = [
    {
        table: "discord_draft_changes",
        parentTable: "discord_draft_sessions",
        parentColumn: "session_id",
        parentKey: "session_id",
    },
    {
        table: "discord_draft_publish_queue",
        parentTable: "discord_draft_sessions",
        parentColumn: "session_id",
        parentKey: "session_id",
    },
    {
        table: "discord_draft_change_deps",
        parentTable: "discord_draft_changes",
        parentColumn: "change_id",
        parentKey: "change_id",
    },
];
