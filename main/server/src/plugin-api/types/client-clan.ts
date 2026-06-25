export type ClanRosterMsg = {
    type: "clan_roster";
    clanName: string;
    fingerprint: string;
    members: { name: string; rank: string | null; joinedAt: string | null }[];
};

export type TitlesSnapshotMsg = {
    type: "clan_titles_snapshot";
    clanName: string;
    fingerprint: string;
    titles: { rank: number; titleId: number; title: string }[];
};

export type ChatMsg = {
    type: "chat";
    channel: string;
    kind: string;
    world: number;
    senderRsn: string;
    text: string;
    eventTs: number;
};

export type ClanClientMessage = ClanRosterMsg | TitlesSnapshotMsg | ChatMsg;
