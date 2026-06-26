import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../../database/core/database.js";
import { pluginModes } from "../../../database/index.js";
import { collectGuildStats } from "./guild-stats-collector.js";
import { collectModeStats } from "./plugin-stats-collector.js";
import { collectAuditStats } from "./collect-audit-stats.js";
import { collectDbStats } from "./collect-db-stats.js";
import type { StatsAcc } from "./stats-acc-types.js";

export type { StatsAcc } from "./stats-acc-types.js";

const DB_STATS_COLLECTORS: ReadonlyArray<{
    file: string;
    collect: (s: StatsAcc, clanId: string, siteAccountId: string, accountHashes: readonly string[]) => void;
}> = [
    {
        file: "clan.db",
        collect: (s, clanId, siteAccountId, accountHashes) => collectDbStats(s, clanId, siteAccountId, accountHashes),
    },
    { file: "clan_audit.db", collect: (s, clanId, siteAccountId) => collectAuditStats(s, clanId, siteAccountId) },
];

export function perClanStats(
    s: StatsAcc,
    clanId: string,
    siteAccountId: string,
    accountHashes: readonly string[],
): void {
    const clanDir = clanDirPath(clanId);
    for (const { file, collect } of DB_STATS_COLLECTORS) {
        if (existsSync(resolve(clanDir, file))) collect(s, clanId, siteAccountId, accountHashes);
    }
    collectGuildStats(s, clanId, siteAccountId);
    for (const mode of pluginModes(clanId)) collectModeStats(s, clanId, mode, accountHashes);
}
