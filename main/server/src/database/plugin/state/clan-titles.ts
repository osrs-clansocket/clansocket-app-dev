import { getClanDb } from "../../core/database.js";
import { clanById } from "../../clans/clan-store.js";
import {
    applyTitleChange,
    prepareCurrentUpsert,
    prepareHistoryInsert,
    type SnapshotRecord,
} from "./clan-titles-writer.js";

export type { ClanTitleEntry, SnapshotRecord } from "./clan-titles-writer.js";

interface CurrentTitleRow {
    rank_position: number;
    title_id: number;
    title_name: string;
}

export interface TitleLadderEntry {
    rank: number;
    title: string;
    titleId: number;
}

function currentTitles(
    db: ReturnType<typeof getClanDb>,
    clanId: string,
): Record<number, { titleId: number; titleName: string }> {
    const currentRows = db
        .prepare("SELECT rank_position, title_id, title_name FROM clan_titles_current WHERE clan_id = ?")
        .all(clanId) as CurrentTitleRow[];
    const map: Record<number, { titleId: number; titleName: string }> = {};
    for (const r of currentRows) map[r.rank_position] = { titleId: r.title_id, titleName: r.title_name };
    return map;
}

export function recordSnapshot(clanId: string, record: SnapshotRecord): number {
    const db = getClanDb(clanId);
    const currentMap = currentTitles(db, record.clanId);
    const insertHistory = prepareHistoryInsert(db);
    const upsertCurrent = prepareCurrentUpsert(db);
    const sessionId = record.sessionId ?? "snapshot";
    const pluginVersion = record.pluginVersion ?? "unknown";
    let changes = 0;
    db.transaction(() => {
        for (const entry of record.titles) {
            const applied = applyTitleChange({
                insertHistory,
                upsertCurrent,
                record,
                sessionId,
                pluginVersion,
                entry,
                prior: currentMap[entry.rank],
            });
            if (applied) changes++;
        }
    })();
    return changes;
}

export function titleLadder(clanId: string): TitleLadderEntry[] {
    if (!clanById(clanId)) return [];
    const rows = getClanDb(clanId)
        .prepare(
            `SELECT rank_position, title_id, title_name
             FROM clan_titles_current WHERE clan_id = ?
             ORDER BY rank_position DESC`,
        )
        .all(clanId) as { rank_position: number; title_id: number; title_name: string }[];
    return rows.map((r) => ({ rank: r.rank_position, title: r.title_name, titleId: r.title_id }));
}
