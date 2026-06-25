import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../../database/index.js";
import {
    DISCORD_BOT_TABLES_BY_DISCORD_USER_ID,
    DISCORD_BOT_TABLES_BY_SITE_ACCOUNT,
} from "../../scopes/manifest/index.js";
import { accumulateTableChanges, prepareTableDelete } from "./purge-stmt-builder.js";
import type { PurgeUserResult } from "./types.js";

export function purgeBotTables(siteAccountId: string, discordUserId: string | null, result: PurgeUserResult): void {
    const botDb = getDb(DB_NAMES.DISCORD_BOT);
    const bySiteStmts = DISCORD_BOT_TABLES_BY_SITE_ACCOUNT.map((spec) => prepareTableDelete(botDb, spec));
    const byUserStmts = DISCORD_BOT_TABLES_BY_DISCORD_USER_ID.map((spec) => prepareTableDelete(botDb, spec));
    botDb.transaction(() => {
        logger.debug(`[purge-bot] bySiteStmts=${bySiteStmts.length} byUserStmts=${byUserStmts.length}`);
        for (const { table, stmt } of bySiteStmts) {
            accumulateTableChanges(result.discordTableDeletes, table, stmt.run(siteAccountId).changes);
        }
        if (discordUserId === null) return;
        for (const { table, stmt } of byUserStmts) {
            accumulateTableChanges(result.discordTableDeletes, table, stmt.run(discordUserId).changes);
        }
    })();
}
