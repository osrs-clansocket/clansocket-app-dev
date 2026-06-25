import { resolveClanWindows } from "../../temporal-correlation.js";
import { dropOwnedDiffs, dropOwnedMembers } from "../../temporal-drops.js";
import type { PurgeUserResult } from "./types.js";

export function dropRosterFootprint(clanId: string, accountHash: string, result: PurgeUserResult): boolean {
    const windows = resolveClanWindows(clanId, [accountHash]);
    if (windows.length === 0) return false;
    const memberDeletes = dropOwnedMembers(clanId, windows);
    const diffDeletes = dropOwnedDiffs(clanId, windows);
    if (memberDeletes + diffDeletes > 0) {
        result.clanRowNulls += memberDeletes + diffDeletes;
        return true;
    }
    return false;
}
