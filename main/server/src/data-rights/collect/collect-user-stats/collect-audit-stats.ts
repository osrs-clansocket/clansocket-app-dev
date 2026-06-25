import { clanAuditDb } from "../../../database/core/database.js";
import { CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES } from "../../scopes/manifest/index.js";
import { statOne } from "./stat-ops.js";
import { acc } from "./utils.js";
import type { StatsAcc } from "./stats-acc-types.js";

export function collectAuditStats(s: StatsAcc, clanId: string, siteAccountId: string): void {
    const auditDb = clanAuditDb(clanId);
    const auditDbKey = `clan_audit:${clanId}`;
    for (const { table, column } of CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES) {
        acc(s.stats, s.dbsTouched, auditDbKey, statOne(auditDb, table, column, siteAccountId));
    }
}
