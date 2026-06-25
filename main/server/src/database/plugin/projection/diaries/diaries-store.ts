import type Database from "better-sqlite3";
import type { PlayerIdentity } from "../projection-utils.js";

export function readPriorTier(conn: Database.Database, accountHash: string, diaryId: string): string | null {
    const row = conn
        .prepare("SELECT tier FROM plugin_diaries WHERE account_hash = ? AND diary_id = ?")
        .get(accountHash, diaryId) as { tier: string } | undefined;
    return row?.tier ?? null;
}

export interface UpsertDiaryArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    diaryId: string;
    diaryName: string;
    region: string;
    tier: string;
    complete: number;
    now: number;
}

export function upsertDiary(args: UpsertDiaryArgs): void {
    const { conn, id, diaryId, diaryName, region, tier, complete, now } = args;
    conn.prepare(
        `INSERT INTO plugin_diaries (account_hash, rsn, diary_id, diary_name, diary_region, tier, complete, first_seen, last_seen, updated_at)
         VALUES ($accountHash, $rsn, $diaryId, $diaryName, $region, $tier, $complete, $now, $now, $now)
         ON CONFLICT (account_hash, diary_id) DO UPDATE SET
            rsn = excluded.rsn,
            diary_name = excluded.diary_name,
            diary_region = excluded.diary_region,
            tier = excluded.tier,
            complete = excluded.complete,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN tier != excluded.tier OR complete != excluded.complete OR diary_name != excluded.diary_name
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: id.rsn ?? "", accountHash: id.accountHash, diaryId, diaryName, region, tier, complete, now });
}
