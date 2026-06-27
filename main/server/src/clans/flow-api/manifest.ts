import { getClanDb } from "../../database/index.js";
import type {
    CapabilityManifest,
    DataSourceAdapter,
    DataSourceItem,
} from "../../flows/registries/registry-types.js";

const CAPABILITY_NAME = "clans";
const CAPABILITY_COLOR = "indigo";

interface MemberRow {
    member_name: string;
    rank: string | null;
}

function listMembersForClan(clanId: string): readonly DataSourceItem[] {
    const rows = getClanDb(clanId)
        .prepare("SELECT member_name, rank FROM clan_members ORDER BY member_name")
        .all() as MemberRow[];
    return rows.map((row) => ({
        id: row.member_name,
        name: row.member_name,
        kind: row.rank ?? undefined,
    }));
}

const membersDataSource: DataSourceAdapter = {
    id: "members",
    label: "Clan members",
    fetch: async (clanId: string): Promise<readonly DataSourceItem[]> => listMembersForClan(clanId),
};

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.1.0",
    capability_color: CAPABILITY_COLOR,
    operations: {},
    triggers: {},
    data_sources: {
        members: membersDataSource,
    },
};
