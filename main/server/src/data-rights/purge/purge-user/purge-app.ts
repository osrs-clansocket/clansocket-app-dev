import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../../database/index.js";
import { APP_TABLES_BY_ACCOUNT_HASH, APP_TABLES_BY_SITE_ACCOUNT } from "../../scopes/manifest/index.js";
import { buildDeleteStmt } from "./builder-purge-stmt.js";
import { accumulateTableChanges } from "./runner-purge-stmt.js";
import type { TableColSpec } from "./purge-stmt-types.js";
import type { PurgeUserResult } from "./types.js";

function prepareKeyedDelete(db: Database.Database, spec: TableColSpec): { key: string; stmt: Database.Statement } {
    return {
        key: `${spec.table}.${spec.column}`,
        stmt: buildDeleteStmt(db, spec.table, spec.column),
    };
}

export function purgeAppTables(accountHash: string, siteAccountId: string, result: PurgeUserResult): void {
    const appDb = getDb(DB_NAMES.APP);
    const byHashStmts = APP_TABLES_BY_ACCOUNT_HASH.map((spec) => prepareKeyedDelete(appDb, spec));
    const bySiteStmts = APP_TABLES_BY_SITE_ACCOUNT.map((spec) => prepareKeyedDelete(appDb, spec));
    appDb.transaction(() => {
        logger.debug(`[purge-app] byHashStmts=${byHashStmts.length} bySiteStmts=${bySiteStmts.length}`);
        for (const { key, stmt } of byHashStmts) {
            accumulateTableChanges(result.appTableDeletes, key, stmt.run(accountHash).changes);
        }
        for (const { key, stmt } of bySiteStmts) {
            accumulateTableChanges(result.appTableDeletes, key, stmt.run(siteAccountId).changes);
        }
    })();
}
