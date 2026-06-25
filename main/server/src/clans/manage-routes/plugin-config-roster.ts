import { getClanDb, getPluginPresence } from "../../database/index.js";
import { canonicalRsn } from "../../database/site/rsn/canonicalize.js";

interface RawRosterMember {
    name: string;
    rank: string | null;
    joinedAt: string | null;
    accountHash?: string | null;
}

export interface RosterMemberResponse {
    accountHash: string;
    rsn: string;
    rank: string | null;
}

type RosterPluginPresence = ReturnType<typeof getPluginPresence>;

function activePluginMember(m: RawRosterMember, presence: RosterPluginPresence): RosterMemberResponse | null {
    const hash = typeof m.accountHash === "string" && m.accountHash.length > 0 ? m.accountHash : null;
    if (hash === null) return null;
    const p = presence[m.name.toLowerCase()];
    if (p?.hasPlugin !== true) return null;
    return { accountHash: hash, rsn: canonicalRsn(m.name), rank: m.rank };
}

export function pluginRosterMembers(clanId: string): RosterMemberResponse[] {
    const row = getClanDb(clanId)
        .prepare(`SELECT members_json FROM clan_rosters ORDER BY captured_at DESC LIMIT 1`)
        .get() as { members_json: string } | undefined;
    if (!row) return [];
    const raw = JSON.parse(row.members_json) as RawRosterMember[];
    const presence = getPluginPresence(clanId, raw);
    const out: RosterMemberResponse[] = [];
    for (const m of raw) {
        const entry = activePluginMember(m, presence);
        if (entry !== null) out.push(entry);
    }
    return out;
}
