import logger from "@clansocket/logger";
import { DB_NAMES, getDb, displacedToPurge } from "../../../database/index.js";
import { MS_PER_DAY } from "../../../shared/time.js";
import { purgeClanData } from "../purge-clan.js";
import { ownedClans, purgeUserData } from "../purge-user/index.js";
import { evaluateClan } from "./evaluate.js";
import { activeClansFor, processPurge, processWarn } from "./process.js";

const UNCLAIMED_THRESHOLD_MS = 7 * MS_PER_DAY;

function applyVerdict(
    clan: Parameters<typeof processPurge>[0],
    verdict: ReturnType<typeof evaluateClan>,
    now: number,
): { warned: number; purged: number } {
    if (verdict === "purge") {
        processPurge(clan);
        return { warned: 0, purged: 1 };
    }
    if (verdict === "warn") {
        return { warned: processWarn(clan, now), purged: 0 };
    }
    return { warned: 0, purged: 0 };
}

export function sweepForManager(siteAccountId: string): { warned: number; purged: number } {
    const now = Date.now();
    let warned = 0;
    let purged = 0;
    for (const clan of activeClansFor(siteAccountId)) {
        const r = applyVerdict(clan, evaluateClan(clan, now), now);
        warned += r.warned;
        purged += r.purged;
    }
    if (warned > 0 || purged > 0) {
        logger.info(`[dead-clan-sweep] manager=${siteAccountId} warned=${warned} purged=${purged}`);
    }
    return { warned, purged };
}

export function sweepStale(): number {
    const cutoff = Date.now() - UNCLAIMED_THRESHOLD_MS;
    const result = getDb(DB_NAMES.APP)
        .prepare(
            `DELETE FROM clansocket_clans
             WHERE status = 'unclaimed' AND archived_at IS NULL AND created_at < ?`,
        )
        .run(cutoff);
    if (result.changes > 0) {
        logger.info(`[dead-clan-sweep] unclaimed_removed=${result.changes}`);
    }
    return result.changes;
}

export function sweepDisplacedAccounts(): number {
    const ready = displacedToPurge();
    let purged = 0;
    for (const row of ready) {
        for (const clan of ownedClans(row.account_hash)) {
            purgeClanData(clan.id);
        }
        purgeUserData(row.account_hash, row.site_account_id);
        purged += 1;
    }
    if (purged > 0) {
        logger.info(`[dead-clan-sweep] displaced_purged=${purged}`);
    }
    return purged;
}
