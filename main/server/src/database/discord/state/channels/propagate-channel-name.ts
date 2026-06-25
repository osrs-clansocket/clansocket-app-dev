import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { withGuildTx } from "../../discord.js";

const CHILD_TABLES = [
    "discord_channel_pins",
    "discord_channel_role_overwrites",
    "discord_channel_member_overwrites",
    "discord_webhooks",
    "discord_webhook_tokens",
] as const;

function prepareChannelUpdate(db: Database.Database, table: string): Database.Statement {
    return db.prepare(`UPDATE ${table} SET channel_name = ? WHERE channel_id = ?`);
}

export function propagateChannelName(clanId: string, guildId: string, channelId: string, newName: string | null): void {
    withGuildTx(clanId, guildId, (db) => {
        logger.debug(
            `[propagate-channel-name] guildId=${guildId} channelId=${channelId} tables=${CHILD_TABLES.length}`,
        );
        const stmts = CHILD_TABLES.map((table) => prepareChannelUpdate(db, table));
        for (const stmt of stmts) {
            stmt.run(newName, channelId);
        }
        db.prepare(`UPDATE discord_channels SET parent_name = ? WHERE parent_id = ?`).run(newName, channelId);
    });
}
