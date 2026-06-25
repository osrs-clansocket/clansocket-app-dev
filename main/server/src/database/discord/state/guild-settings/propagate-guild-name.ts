import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { withGuildTx } from "../../discord.js";

const TABLES = [
    "discord_auto_hooks",
    "discord_channels",
    "discord_channel_member_overwrites",
    "discord_channel_pins",
    "discord_channel_role_overwrites",
    "discord_members",
    "discord_roles",
    "discord_server_emojis",
    "discord_server_stickers",
    "discord_user_permissions",
    "discord_webhooks",
    "discord_webhook_tokens",
] as const;

function prepareGuildUpdate(db: Database.Database, table: string): Database.Statement {
    return db.prepare(`UPDATE ${table} SET guild_name = ? WHERE guild_id = ?`);
}

export function propagateGuildName(clanId: string, guildId: string, newName: string | null): void {
    withGuildTx(clanId, guildId, (db) => {
        logger.debug(`[propagate-guild-name] guildId=${guildId} tables=${TABLES.length}`);
        const stmts = TABLES.map((table) => prepareGuildUpdate(db, table));
        for (const stmt of stmts) {
            stmt.run(newName, guildId);
        }
    });
}
