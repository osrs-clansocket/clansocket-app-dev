import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { withGuildTx } from "../../discord.js";

const CHILD_TABLES = ["discord_auto_hooks", "discord_webhook_tokens"] as const;
const PROBE_TABLE = CHILD_TABLES[0];
const PROBE_SQL = `SELECT webhook_name AS n FROM ${PROBE_TABLE} WHERE webhook_id = ? LIMIT 1`;

interface ProbeRow {
    n: string | null;
}

function prepareWebhookUpdate(db: Database.Database, table: string): Database.Statement {
    return db.prepare(`UPDATE ${table} SET webhook_name = ? WHERE webhook_id = ?`);
}

export function propagateWebhookName(clanId: string, guildId: string, webhookId: string, newName: string | null): void {
    withGuildTx(clanId, guildId, (db) => {
        const probe = db.prepare(PROBE_SQL).get(webhookId) as ProbeRow | undefined;
        if (probe !== undefined && probe.n === newName) return;
        logger.debug(
            `[propagate-webhook-name] guildId=${guildId} webhookId=${webhookId} tables=${CHILD_TABLES.length}`,
        );
        const stmts = CHILD_TABLES.map((table) => prepareWebhookUpdate(db, table));
        for (const stmt of stmts) {
            stmt.run(newName, webhookId);
        }
    });
}
