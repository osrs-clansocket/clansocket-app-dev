import { clanBySlug } from "../database/index.js";
import { isClanManager } from "../database/clans/access/clan-manager-store.js";

export function loadOwnedClan(slug: string, siteAccountId: string): { id: string; slug: string } | null {
    const clan = clanBySlug(slug);
    if (!clan || clan.archived_at !== null) return null;
    if (!isClanManager(siteAccountId, clan.id)) return null;
    return { id: clan.id, slug: clan.slug };
}
