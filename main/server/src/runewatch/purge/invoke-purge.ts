import logger from "@clansocket/logger";
import { purgeUserData } from "../../data-rights/purge/purge-user/index.js";
import { findAccountsRsn } from "../../database/site/runewatch/accounts-by-rsn.js";

export interface PurgeOutcome {
    rsnNormalized: string;
    accountsPurged: number;
}

export function invokePurge(rsnNormalized: string): PurgeOutcome {
    const accounts = findAccountsRsn(rsnNormalized);
    let purged = 0;
    for (const a of accounts) {
        try {
            purgeUserData(a.account_hash, a.site_account_id, { preserveRoster: true });
            purged += 1;
        } catch (err) {
            logger.error(`runewatch.purge failed rsn=${rsnNormalized} accountHash=${a.account_hash}`, {
                error: String(err),
            });
        }
    }
    return { rsnNormalized, accountsPurged: purged };
}
