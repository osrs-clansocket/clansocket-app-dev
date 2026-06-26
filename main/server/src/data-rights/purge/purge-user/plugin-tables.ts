import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { wasWritten } from "../../../database/core/operations/index.js";
import { clanPluginDb, pluginModes } from "../../../database/index.js";
import { PLUGIN_USER_TABLES } from "../../scopes/manifest/index.js";
import type { PurgeUserResult } from "./types.js";

function preparePluginDelete(db: Database.Database, spec: { table: string; column: string }): Database.Statement {
    return db.prepare(`DELETE FROM ${spec.table} WHERE ${spec.column} = ?`);
}

function purgeOneMode(clanId: string, mode: string, accountHash: string, result: PurgeUserResult): boolean {
    let touched = false;
    const pluginDb = clanPluginDb(clanId, mode);
    const stmts = PLUGIN_USER_TABLES.map((spec) => preparePluginDelete(pluginDb, spec));
    pluginDb.transaction(() => {
        logger.debug(`[purge-plugin] clanId=${clanId} mode=${mode} stmts=${stmts.length}`);
        for (const stmt of stmts) {
            const r = stmt.run(accountHash);
            if (wasWritten(r)) {
                result.pluginRowDeletes += r.changes;
                touched = true;
            }
        }
    })();
    return touched;
}

export function purgePluginModes(clanId: string, accountHash: string, result: PurgeUserResult): boolean {
    let touched = false;
    for (const mode of pluginModes(clanId)) {
        if (purgeOneMode(clanId, mode, accountHash, result)) touched = true;
    }
    return touched;
}
