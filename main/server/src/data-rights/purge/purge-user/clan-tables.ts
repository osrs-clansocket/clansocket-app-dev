import logger from "@clansocket/logger";
import { clanAuditDb } from "../../../database/core/database.js";
import { wasWritten } from "../../../database/core/operations/index.js";
import { getClanDb } from "../../../database/index.js";
import {
    CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_USER_TABLES,
} from "../../scopes/manifest/index.js";
import type { PurgeUserResult } from "./types.js";
import { dropRosterFootprint } from "./roster-footprint.js";
import { prepareScopedStmt } from "./scoped-stmt.js";

export function purgeAudit(clanId: string, siteAccountId: string, result: PurgeUserResult): boolean {
    const auditDb = clanAuditDb(clanId);
    const stmts = CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES.map((def) => prepareScopedStmt(auditDb, def));
    return auditDb.transaction(() => {
        logger.debug(`[purge-audit] clanId=${clanId} stmts=${stmts.length}`);
        return runScopedBatch(stmts, siteAccountId, result);
    })();
}

export interface PurgeClanDb {
    clanId: string;
    accountHash: string;
    siteAccountId: string;
    result: PurgeUserResult;
    preserveRoster: boolean;
}

interface ScopedRun {
    accountHash: string;
    siteAccountId: string;
    result: PurgeUserResult;
}

function runScopedBatch(
    stmts: Array<{ stmt: ReturnType<ReturnType<typeof getClanDb>["prepare"]> }>,
    scopeValue: string,
    result: PurgeUserResult,
): boolean {
    logger.debug(`[purge-batch] stmts=${stmts.length}`);
    let touched = false;
    for (const { stmt } of stmts) {
        const r = stmt.run(scopeValue);
        if (wasWritten(r)) {
            result.clanRowNulls += r.changes;
            touched = true;
        }
    }
    return touched;
}

function runScopedStmts(clanDb: ReturnType<typeof getClanDb>, a: ScopedRun): boolean {
    const userStmts = CLAN_DB_USER_TABLES.map((def) => prepareScopedStmt(clanDb, def));
    const siteStmts = CLAN_DB_SITE_ACCOUNT_TABLES.map((def) => prepareScopedStmt(clanDb, def));
    return clanDb.transaction(() => {
        logger.debug(`[purge-clan-db] userStmts=${userStmts.length} siteStmts=${siteStmts.length}`);
        const userTouched = runScopedBatch(userStmts, a.accountHash, a.result);
        const siteTouched = runScopedBatch(siteStmts, a.siteAccountId, a.result);
        return userTouched || siteTouched;
    })();
}

export function purgeClanDb(args: PurgeClanDb): boolean {
    const { clanId, accountHash, siteAccountId, result, preserveRoster } = args;
    const touched = runScopedStmts(getClanDb(clanId), { accountHash, siteAccountId, result });
    if (preserveRoster) return touched;
    return dropRosterFootprint(clanId, accountHash, result) || touched;
}
