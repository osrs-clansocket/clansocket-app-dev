import { createHash } from "node:crypto";
import { getClanDb } from "../../core/database.js";

export interface ClanTitleEntry {
    rank: number;
    titleId: number;
    title: string;
}

export interface SnapshotRecord {
    clanId: string;
    clanName: string;
    accountHash: string;
    rsn: string;
    titles: readonly ClanTitleEntry[];
    observedAt: number;
    sessionId?: string;
    pluginVersion?: string;
    schemaVersion?: number;
}

interface TitleDedupArgs {
    accountHash: string;
    clanId: string;
    rankPosition: number;
    newTitleId: number;
    observedAt: number;
}

function titleDedupHash(args: TitleDedupArgs): string {
    const { accountHash, clanId, rankPosition, newTitleId, observedAt } = args;
    return createHash("sha256")
        .update(`${accountHash}|clan_titles_history|${clanId}|${rankPosition}|${newTitleId}|${observedAt}`)
        .digest("hex");
}

export function prepareHistoryInsert(db: ReturnType<typeof getClanDb>) {
    return db.prepare(
        `INSERT INTO clan_titles_history
            (account_hash, rsn, session_id, session_seq,
             event_received_at, plugin_version,
             clan_id, clan_name, rank_position,
             old_title_id, old_title_name, new_title_id, new_title_name,
             world, x, y, plane, region_id, region_name, area,
             dedup_hash)
         VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                 NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?)
         ON CONFLICT(dedup_hash) DO NOTHING`,
    );
}

export function prepareCurrentUpsert(db: ReturnType<typeof getClanDb>) {
    return db.prepare(
        `INSERT INTO clan_titles_current
            (account_hash, rsn, clan_id, clan_name, rank_position, title_id, title_name, observed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(clan_id, rank_position) DO UPDATE SET
            account_hash = excluded.account_hash,
            rsn = excluded.rsn,
            clan_name = excluded.clan_name,
            title_id = excluded.title_id,
            title_name = excluded.title_name,
            observed_at = excluded.observed_at`,
    );
}

export interface ApplyTitleArgs {
    insertHistory: ReturnType<typeof prepareHistoryInsert>;
    upsertCurrent: ReturnType<typeof prepareCurrentUpsert>;
    record: SnapshotRecord;
    sessionId: string;
    pluginVersion: string;
    entry: ClanTitleEntry;
    prior: { titleId: number; titleName: string } | undefined;
}

function runHistoryInsert(args: ApplyTitleArgs, dedup: string): void {
    const { insertHistory, record, sessionId, pluginVersion, entry, prior } = args;
    insertHistory.run(
        record.accountHash,
        record.rsn,
        sessionId,
        record.observedAt,
        pluginVersion,
        record.clanId,
        record.clanName,
        entry.rank,
        prior?.titleId ?? null,
        prior?.titleName ?? null,
        entry.titleId,
        entry.title,
        dedup,
    );
}

function runCurrentUpsert(args: ApplyTitleArgs): void {
    const { upsertCurrent, record, entry } = args;
    upsertCurrent.run(
        record.accountHash,
        record.rsn,
        record.clanId,
        record.clanName,
        entry.rank,
        entry.titleId,
        entry.title,
        record.observedAt,
    );
}

export function applyTitleChange(args: ApplyTitleArgs): boolean {
    const { record, entry, prior } = args;
    const isNew = prior === undefined;
    const isChanged = !isNew && (prior.titleId !== entry.titleId || prior.titleName !== entry.title);
    if (!isNew && !isChanged) return false;
    const dedup = titleDedupHash({
        accountHash: record.accountHash,
        clanId: record.clanId,
        rankPosition: entry.rank,
        newTitleId: entry.titleId,
        observedAt: record.observedAt,
    });
    runHistoryInsert(args, dedup);
    runCurrentUpsert(args);
    return true;
}
