import type Database from "better-sqlite3";
import type { PlayerIdentity } from "./projection-utils.js";

export interface NpcKcArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    sourceKind: string;
    sourceId: number | null;
    sourceName: string | null;
    kc: number | null;
    now: number;
}

interface NpcKcInsert {
    conn: Database.Database;
    id: PlayerIdentity;
    sourceId: number;
    sourceName: string;
    kc: number;
    now: number;
}

function insertNpcKc(args: NpcKcInsert): void {
    const { conn, id, sourceId, sourceName, kc, now } = args;
    conn.prepare(
        `INSERT INTO plugin_npc_kc (
            account_hash, rsn, source_id, source_name,
            kc, kc_source, kc_updated_at,
            first_seen, last_seen, updated_at
         ) VALUES ($accountHash, $rsn, $sourceId, $sourceName, $kc, 'plugin', $now, $now, $now, $now)
         ON CONFLICT (account_hash, source_id) DO UPDATE SET
            rsn = excluded.rsn,
            source_name = excluded.source_name,
            kc = excluded.kc,
            kc_source = 'plugin',
            kc_updated_at = excluded.kc_updated_at,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN kc != excluded.kc OR source_name != excluded.source_name
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: id.rsn ?? "", accountHash: id.accountHash, sourceId, sourceName, kc, now });
}

function deleteStaleKc(conn: Database.Database, accountHash: string, sourceName: string): void {
    conn.prepare(
        `DELETE FROM plugin_npc_kc
         WHERE account_hash = ? AND source_id < 0 AND source_name = ? COLLATE NOCASE`,
    ).run(accountHash, sourceName);
}

export function reconcileNpcKc(args: NpcKcArgs): void {
    const { conn, id, sourceKind, sourceId, sourceName, kc, now } = args;
    if (sourceKind !== "NPC" || sourceId === null || sourceName === null || kc === null) return;
    insertNpcKc({ conn, id, sourceId, sourceName, kc, now });
    deleteStaleKc(conn, id.accountHash, sourceName);
}
