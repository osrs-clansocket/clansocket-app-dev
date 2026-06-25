import { getClanDb, DB_NAMES, getDb } from "../../core/database.js";
import type { RunewatchCaseRow } from "./lookup-by-rsn.js";

const SELECT_MEMBERS_SQL = `SELECT member_name FROM clan_members`;

interface MemberRow {
    member_name: string;
}

const NBSP = " ";

function normalize(s: string): string {
    return s.split(NBSP).join(" ").toLowerCase().trim();
}

export interface FlaggedMember {
    member_name: string;
    rsn_normalized: string;
    cases: RunewatchCaseRow[];
}

function loadClanMembers(clanId: string): Array<{ original: string; normalized: string }> {
    const memberRows = getClanDb(clanId).prepare(SELECT_MEMBERS_SQL).all() as MemberRow[];
    return memberRows.map((m) => ({ original: m.member_name, normalized: normalize(m.member_name) }));
}

function loadCases(normalized: string[]): RunewatchCaseRow[] {
    const placeholders = normalized.map(() => "?").join(",");
    return getDb(DB_NAMES.APP)
        .prepare(
            `SELECT case_key, hash, tier, accused_rsn, rsn_normalized, reason,
                    evidence_rating, source, quick_find, published_at, synced_at
             FROM clansocket_runewatch_cases
             WHERE rsn_normalized IN (${placeholders})
             ORDER BY tier ASC, published_at DESC`,
        )
        .all(...normalized) as RunewatchCaseRow[];
}

export function listFlaggedClan(clanId: string): FlaggedMember[] {
    const members = loadClanMembers(clanId);
    if (members.length === 0) return [];
    const cases = loadCases(members.map((m) => m.normalized));
    if (cases.length === 0) return [];
    const byRsn: Record<string, RunewatchCaseRow[]> = {};
    for (const c of cases) {
        byRsn[c.rsn_normalized] ??= [];
        byRsn[c.rsn_normalized].push(c);
    }
    const flagged: FlaggedMember[] = [];
    for (const m of members) {
        const matched = byRsn[m.normalized];
        if (matched && matched.length > 0) {
            flagged.push({ member_name: m.original, rsn_normalized: m.normalized, cases: matched });
        }
    }
    return flagged;
}
