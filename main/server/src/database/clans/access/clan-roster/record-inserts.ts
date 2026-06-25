import logger from "@clansocket/logger";
import type Database from "better-sqlite3";
import { diffRosters } from "./diffs.js";
import type { ClanRosterMember } from "./types.js";

export interface PreviousRoster {
    fingerprint: string;
    members_json: string;
}

export interface SnapshotArgs {
    db: Database.Database;
    fingerprint: string;
    now: number;
    capturedByAccountHash: string;
    capturedByRsn: string | null;
    members: ClanRosterMember[];
}

export interface ClanSnapshotArgs {
    db: Database.Database;
    capturedByAccountHash: string;
    capturedByRsn: string | null;
    clanId: string;
    clanName: string;
    memberCount: number;
    now: number;
}

export interface DiffsArgs {
    db: Database.Database;
    previous: PreviousRoster;
    fingerprint: string;
    members: ClanRosterMember[];
    now: number;
}

const INSERT_ROSTER_SQL = `INSERT INTO clan_rosters (fingerprint, captured_at, captured_by_account_hash, captured_by_rsn, member_count, members_json)
 VALUES (?, ?, ?, ?, ?, ?)`;

const INSERT_CLAN_SNAPSHOT_SQL = `INSERT INTO clan_snapshots (account_hash, rsn, clan_id, clan_name, member_count, online_count, observed_at)
 VALUES (?, ?, ?, ?, ?, NULL, ?)
 ON CONFLICT (account_hash, observed_at) DO NOTHING`;

function runInsert(db: Database.Database, sql: string, bindings: readonly unknown[]): void {
    db.prepare(sql).run(...bindings);
}

export function insertRosterSnapshot(args: SnapshotArgs): void {
    runInsert(args.db, INSERT_ROSTER_SQL, [
        args.fingerprint,
        args.now,
        args.capturedByAccountHash,
        args.capturedByRsn,
        args.members.length,
        JSON.stringify(args.members),
    ]);
}

export function insertClanSnapshot(args: ClanSnapshotArgs): void {
    runInsert(args.db, INSERT_CLAN_SNAPSHOT_SQL, [
        args.capturedByAccountHash,
        args.capturedByRsn ?? "",
        args.clanId,
        args.clanName,
        args.memberCount,
        args.now,
    ]);
}

export function upsertMembers(db: Database.Database, members: ClanRosterMember[], now: number): void {
    logger.debug(`[roster] upsertMembers count=${members.length}`);
    const stmt = db.prepare(
        `INSERT INTO clan_members (member_name, account_hash, rank, joined_at, first_observed_at, last_observed_at)
         VALUES ($memberName, $accountHash, $rank, $joinedAt, $now, $now)
         ON CONFLICT(member_name) DO UPDATE SET
           account_hash = excluded.account_hash,
           rank = excluded.rank,
           joined_at = COALESCE(excluded.joined_at, clan_members.joined_at),
           last_observed_at = excluded.last_observed_at`,
    );
    for (const m of members) {
        stmt.run({
            memberName: m.name,
            accountHash: m.accountHash ?? null,
            rank: m.rank ?? null,
            joinedAt: m.joinedAt ?? null,
            now,
        });
    }
}

export function recordRosterDiffs(args: DiffsArgs): number {
    logger.debug(`[roster] recordRosterDiffs prev=${args.previous.fingerprint} new=${args.fingerprint}`);
    const prevMembers = JSON.parse(args.previous.members_json) as ClanRosterMember[];
    const events = diffRosters(prevMembers, args.members);
    const stmt = args.db.prepare(
        `INSERT INTO clan_roster_diffs (from_fingerprint, to_fingerprint, event_type, member_name, old_value, new_value, detected_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const e of events) {
        stmt.run(
            args.previous.fingerprint,
            args.fingerprint,
            e.event_type,
            e.member_name,
            e.old_value,
            e.new_value,
            args.now,
        );
    }
    return events.length;
}
