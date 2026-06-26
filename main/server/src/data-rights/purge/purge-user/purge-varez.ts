import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../../database/index.js";
import { VAREZ_TABLES_BY_SITE_ACCOUNT } from "../../scopes/manifest/index.js";
import { prepareTableDelete } from "./builder-purge-stmt.js";
import { accumulateTableChanges } from "./runner-purge-stmt.js";
import type { PurgeUserResult } from "./types.js";

export function purgeVarezTables(siteAccountId: string, result: PurgeUserResult): void {
    const varezDb = getDb(DB_NAMES.AI);
    const stmts = VAREZ_TABLES_BY_SITE_ACCOUNT.map((spec) => prepareTableDelete(varezDb, spec));
    varezDb.transaction(() => {
        logger.debug(`[purge-varez] siteAccountId=${siteAccountId} stmts=${stmts.length}`);
        for (const { table, stmt } of stmts) {
            accumulateTableChanges(result.varezTableDeletes, table, stmt.run(siteAccountId).changes);
        }
    })();
}
