import { pendingByAccount } from "../../../database/index.js";
import { type ConsentRequestRow } from "../../../database/site/consent/types.js";

export function findExistingClaim(siteAccountId: string, rsn: string, clanName: string): ConsentRequestRow | undefined {
    return pendingByAccount(siteAccountId, "claim").find(
        (r) =>
            r.target_rsn.toLowerCase() === rsn.toLowerCase() &&
            (r.declared_clan_name ?? "").toLowerCase() === clanName.toLowerCase(),
    );
}
