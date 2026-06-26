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
const PROBE_TABLE = TABLES[0];
const PROBE_SQL = `SELECT guild_name AS n FROM ${PROBE_TABLE} WHERE guild_id = ? LIMIT 1`;

interface ProbeRow {
    n: string | null;
}

function prepareGuildUpdate(db: Database.Database, table: string): Database.Statement {
    return db.prepare(`UPDATE ${table} SET guild_name = ? WHERE guild_id = ?`);
}

export function propagateGuildName(clanId: string, guildId: string, newName: string | null): void {
    withGuildTx(clanId, guildId, (db) => {
        const probe = db.prepare(PROBE_SQL).get(guildId) as ProbeRow | undefined;
        if (probe !== undefined && probe.n === newName) return;
        logger.debug(`[propagate-guild-name] guildId=${guildId} tables=${TABLES.length}`);
        const stmts = TABLES.map((table) => prepareGuildUpdate(db, table));
        for (const stmt of stmts) {
            stmt.run(newName, guildId);
        }
    });
}
