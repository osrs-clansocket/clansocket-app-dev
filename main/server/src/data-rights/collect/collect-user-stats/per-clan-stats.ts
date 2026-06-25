import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../../database/core/database.js";
import { pluginModes } from "../../../database/index.js";
import { collectGuildStats } from "./guild-stats-collector.js";
import { collectModeStats } from "./plugin-stats-collector.js";
import { collectAuditStats } from "./collect-audit-stats.js";
import { collectDbStats } from "./collect-db-stats.js";

export type { StatsAcc } from "./stats-acc-types.js";

export function perClanStats(
    s: import("./stats-acc-types.js").StatsAcc,
    clanId: string,
    siteAccountId: string,
    accountHashes: readonly string[],
): void {
    const clanDir = clanDirPath(clanId);
    if (existsSync(resolve(clanDir, "clan.db"))) collectDbStats(s, clanId, siteAccountId, accountHashes);
    if (existsSync(resolve(clanDir, "clan_audit.db"))) collectAuditStats(s, clanId, siteAccountId);
    collectGuildStats(s, clanId, siteAccountId);
    for (const mode of pluginModes(clanId)) collectModeStats(s, clanId, mode, accountHashes);
}
