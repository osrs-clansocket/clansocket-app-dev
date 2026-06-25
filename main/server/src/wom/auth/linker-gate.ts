import { ownerSiteId } from "../../clansocket/auth/clan-owner-lookup.js";

export function isWomOwner(siteAccountId: string, clanId: string, existingLinkerId: string): boolean {
    if (siteAccountId === existingLinkerId) return true;
    return siteAccountId === ownerSiteId(clanId);
}
