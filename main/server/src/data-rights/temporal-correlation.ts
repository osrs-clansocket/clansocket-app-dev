import type Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DB_NAMES, getClanDb, hashesForAccount } from "../database/index.js";
import { clanDirPath } from "../database/core/database.js";
import { sqlPlaceholders } from "../database/core/operations/index.js";
import { selectColumns, selectRows } from "../shared/loaders/db-rows.js";

interface RsnHistoryRow {
    rsn: string;
    accountHash: string;
    firstSeen: number;
    lastSeen: number;
}

export interface OwnedRsnWindow {
    rsn: string;
    accountHash: string;
    firstSeen: number;
    lastSeen: number;
}

export interface ClanWindowSet {
    clanId: string;
    windows: OwnedRsnWindow[];
}

export function clanIds(): string[] {
    return selectColumns<string>(DB_NAMES.APP, `SELECT id FROM clansocket_clans`);
}

function windowsForHashes(hashes: readonly string[]): OwnedRsnWindow[] {
    if (hashes.length === 0) return [];
    return selectRows<RsnHistoryRow>(
        DB_NAMES.APP,
        `SELECT rsn, account_hash AS accountHash, first_seen AS firstSeen, last_seen AS lastSeen
         FROM clansocket_account_rsns WHERE account_hash IN (${sqlPlaceholders(hashes.length)})`,
        ...hashes,
    );
}

export function resolveClanWindows(clanId: string, hashes: readonly string[]): OwnedRsnWindow[] {
    if (!clanDbExists(clanId)) return [];
    return windowsForHashes(hashes);
}

export function allClanWindows(siteAccountId: string): ClanWindowSet[] {
    const hashes = hashesForAccount(siteAccountId);
    if (hashes.length === 0) return [];
    const windows = windowsForHashes(hashes);
    if (windows.length === 0) return [];
    const out: ClanWindowSet[] = [];
    for (const clanId of clanIds()) {
        if (!clanDbExists(clanId)) continue;
        out.push({ clanId, windows });
    }
    return out;
}

export interface ClanMemberRow {
    member_name: string;
    rank: string | null;
    joined_at: string | null;
    first_observed_at: number;
    last_observed_at: number;
}

export interface RosterDiffRow {
    id: number;
    from_fingerprint: string | null;
    to_fingerprint: string;
    event_type: string;
    member_name: string | null;
    old_value: string | null;
    new_value: string | null;
    detected_at: number;
}

function clanDbExists(clanId: string): boolean {
    return existsSync(resolve(clanDirPath(clanId), "clan.db"));
}

function skipClanWindows(clanId: string, windows: OwnedRsnWindow[]): boolean {
    return windows.length === 0 || !clanDbExists(clanId);
}

function selectMemberWindow(stmt: Database.Statement, w: OwnedRsnWindow): ClanMemberRow | null {
    const row = stmt.get(w.rsn, w.firstSeen, w.lastSeen) as ClanMemberRow | undefined;
    return row ?? null;
}

export function ownedMembers(clanId: string, windows: OwnedRsnWindow[]): ClanMemberRow[] {
    if (skipClanWindows(clanId, windows)) return [];
    const clanDb = getClanDb(clanId);
    const stmt = clanDb.prepare(
        `SELECT member_name, rank, joined_at, first_observed_at, last_observed_at
         FROM clan_members WHERE member_name = ? AND last_observed_at >= ? AND first_observed_at <= ?`,
    );
    const out: ClanMemberRow[] = [];
    for (const w of windows) {
        const row = selectMemberWindow(stmt, w);
        if (row) out.push(row);
    }
    return out;
}

function selectDiffWindow(stmt: Database.Statement, w: OwnedRsnWindow): RosterDiffRow[] {
    return stmt.all(w.rsn, w.firstSeen, w.lastSeen) as RosterDiffRow[];
}

export function ownedDiffs(clanId: string, windows: OwnedRsnWindow[]): RosterDiffRow[] {
    if (skipClanWindows(clanId, windows)) return [];
    const clanDb = getClanDb(clanId);
    const stmt = clanDb.prepare(
        `SELECT id, from_fingerprint, to_fingerprint, event_type, member_name, old_value, new_value, detected_at
         FROM clan_roster_diffs WHERE member_name = ? AND detected_at BETWEEN ? AND ?`,
    );
    const out: RosterDiffRow[] = [];
    const seen = new Set<number>();
    for (const w of windows) {
        const rows = selectDiffWindow(stmt, w);
        for (const row of rows) {
            if (seen.has(row.id)) continue;
            seen.add(row.id);
            out.push(row);
        }
    }
    return out;
}
