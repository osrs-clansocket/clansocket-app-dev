export interface MemberClan {
    id: string;
    slug: string;
    displayName: string;
}

export interface LegacyRsnMatch {
    clanId: string;
    clanSlug: string;
    clanDisplayName: string;
    legacyRsn: string;
    matchCount: number;
}
