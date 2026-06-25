export type IdentityMsg = {
    type: "identity";
    rsn: string;
    accountHash: string;
    accountType?: string;
    world: number;
    worldTypes: string[];
    activity?: string;
    clanName?: string;
    clanRank?: string;
    clanJoinedAt?: string;
    clanMemberCount?: number;
    clanOnlineCount?: number;
    pluginVersion?: string;
    schemaVersion?: number;
    sessionStart: string;
};
