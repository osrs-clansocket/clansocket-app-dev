import { DB_NAMES, getDb } from "../../../../core/database.js";
import { loadAccountBindings } from "./load-account-bindings.js";
import { loadAccountLabels } from "./load-account-labels.js";
import { loadHashRsns } from "./load-hash-rsns.js";

function pickBestRsn(
    hashes: readonly string[],
    rsnByHash: Record<string, { rsn: string; lastSeen: number }>,
): { rsn: string; lastSeen: number } | null {
    let best: { rsn: string; lastSeen: number } | null = null;
    for (const h of hashes) {
        const candidate = rsnByHash[h];
        if (candidate && (!best || candidate.lastSeen > best.lastSeen)) best = candidate;
    }
    return best;
}

export function resolveActorDisplays(clanId: string, siteAccountIds: readonly string[]): Record<string, string> {
    const out: Record<string, string> = {};
    if (siteAccountIds.length === 0) return out;
    const placeholders = siteAccountIds.map(() => "?").join(",");
    const appDb = getDb(DB_NAMES.APP);
    const accountLabels = loadAccountLabels(appDb, placeholders, siteAccountIds);
    const { hashesByAccount, allHashes } = loadAccountBindings(appDb, placeholders, siteAccountIds);
    const rsnByHash = loadHashRsns(clanId, allHashes);
    for (const id of siteAccountIds) {
        const best = pickBestRsn(hashesByAccount[id] ?? [], rsnByHash);
        if (best) {
            out[id] = best.rsn;
            continue;
        }
        const label = accountLabels[id];
        if (label) out[id] = label;
    }
    return out;
}
