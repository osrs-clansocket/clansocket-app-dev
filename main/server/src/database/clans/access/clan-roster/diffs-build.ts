import type { ClanRosterMember } from "./types.js";

export interface RosterDiffEvent {
    event_type: "member_joined" | "member_left" | "rank_changed";
    member_name: string;
    old_value: string | null;
    new_value: string | null;
}

function compareMemberPair(
    name: string,
    before: ClanRosterMember | undefined,
    after: ClanRosterMember,
): RosterDiffEvent | null {
    if (!before) {
        return { event_type: "member_joined", member_name: name, old_value: null, new_value: after.rank };
    }
    if ((before.rank ?? "") !== (after.rank ?? "")) {
        return { event_type: "rank_changed", member_name: name, old_value: before.rank, new_value: after.rank };
    }
    return null;
}

export function diffRosters(prev: ClanRosterMember[], next: ClanRosterMember[]): RosterDiffEvent[] {
    const indexBy = (members: ClanRosterMember[]): Record<string, ClanRosterMember> => {
        const by: Record<string, ClanRosterMember> = {};
        for (const m of members) by[m.name] = m;
        return by;
    };
    const prevByName = indexBy(prev);
    const nextByName = indexBy(next);
    const events: RosterDiffEvent[] = [];
    for (const [name, member] of Object.entries(nextByName)) {
        const change = compareMemberPair(name, prevByName[name], member);
        if (change) events.push(change);
    }
    for (const [name, member] of Object.entries(prevByName)) {
        if (!(name in nextByName)) {
            events.push({ event_type: "member_left", member_name: name, old_value: member.rank, new_value: null });
        }
    }
    return events;
}
