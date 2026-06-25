import { clansClient, type ClanAuditEntry } from "../clans-client/index.js";
import type { AuditFeedOptions } from "./feed-types.js";

export function makeFetchPage(
    slug: string,
    filters: AuditFeedOptions["filters"],
    limit: number,
): (before: number | undefined) => Promise<{ entries: ClanAuditEntry[]; hasMore: boolean; nextBefore: number | null }> {
    return (before) =>
        clansClient.listClanAudit(slug, {
            before,
            limit,
            after: filters.afterTs,
            kindPrefix: filters.kindPrefix ?? undefined,
            kindExclude: filters.kindExclude ?? undefined,
        });
}
