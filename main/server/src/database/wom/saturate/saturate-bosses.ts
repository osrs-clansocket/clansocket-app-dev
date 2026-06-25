import logger from "@clansocket/logger";
import { clanPluginDb } from "../../core/database.js";

export interface WomBossRow {
    accountHash: string;
    rsn: string;
    slug: string;
    sourceName: string;
    kc: number;
    lastChangedAtMs: number;
}

const JAVA_HASH_PRIME = 31;
const NEGATIVE_FLIP_OFFSET = 1;

export function slugToId(slug: string): number {
    let h = 0;
    const normalized = slug.trim().toLowerCase();
    for (let i = 0; i < normalized.length; i++) {
        h = (h * JAVA_HASH_PRIME + normalized.charCodeAt(i)) | 0;
    }
    return h >= 0 ? -NEGATIVE_FLIP_OFFSET - h : h;
}

function prefetchExisting(db: ReturnType<typeof clanPluginDb>, rows: readonly WomBossRow[]): Set<string> {
    if (rows.length === 0) return new Set();
    const params: unknown[] = [];
    for (const r of rows) params.push(r.accountHash, r.sourceName);
    const placeholders = rows.map(() => "(?, ?)").join(",");
    const existing = db
        .prepare(
            `SELECT account_hash, source_name FROM plugin_npc_kc
             WHERE source_id > 0 AND (account_hash, source_name COLLATE NOCASE) IN (VALUES ${placeholders})`,
        )
        .all(...params) as { account_hash: string; source_name: string }[];
    const seen = new Set<string>();
    for (const e of existing) seen.add(`${e.account_hash}|${e.source_name.toLowerCase()}`);
    return seen;
}

const UPSERT_SQL = `INSERT INTO plugin_npc_kc (
    account_hash, rsn, source_id, source_name,
    kc, kc_source, kc_updated_at,
    first_seen, last_seen, updated_at
) VALUES ($accountHash, $rsn, $sourceId, $sourceName, $kc, 'wom', $changedAt, $now, $now, $now)
ON CONFLICT(account_hash, source_id) DO UPDATE SET
    rsn = excluded.rsn,
    source_name = excluded.source_name,
    kc = CASE
        WHEN plugin_npc_kc.kc_updated_at IS NOT NULL
            AND plugin_npc_kc.kc_updated_at >= excluded.kc_updated_at
        THEN plugin_npc_kc.kc
        ELSE MAX(plugin_npc_kc.kc, excluded.kc)
    END,
    kc_source = CASE
        WHEN plugin_npc_kc.kc_updated_at IS NOT NULL
            AND plugin_npc_kc.kc_updated_at >= excluded.kc_updated_at
        THEN COALESCE(plugin_npc_kc.kc_source, 'plugin')
        WHEN excluded.kc > plugin_npc_kc.kc
        THEN 'wom'
        ELSE COALESCE(plugin_npc_kc.kc_source, 'plugin')
    END,
    kc_updated_at = CASE
        WHEN plugin_npc_kc.kc_updated_at IS NOT NULL
            AND plugin_npc_kc.kc_updated_at >= excluded.kc_updated_at
        THEN plugin_npc_kc.kc_updated_at
        WHEN excluded.kc > plugin_npc_kc.kc
        THEN excluded.kc_updated_at
        ELSE plugin_npc_kc.kc_updated_at
    END,
    last_seen = excluded.last_seen,
    updated_at = excluded.updated_at`;

export function saturateBossesWom(clanId: string, mode: string, rows: readonly WomBossRow[]): number {
    if (rows.length === 0) return 0;
    const db = clanPluginDb(clanId, mode);
    const stmt = db.prepare(UPSERT_SQL);
    const existing = prefetchExisting(db, rows);
    const now = Date.now();
    let written = 0;
    db.transaction(() => {
        logger.debug(`[wom-bosses] saturate clanId=${clanId} mode=${mode} rows=${rows.length}`);
        for (const row of rows) {
            if (existing.has(`${row.accountHash}|${row.sourceName.toLowerCase()}`)) continue;
            stmt.run({
                accountHash: row.accountHash,
                rsn: row.rsn,
                sourceId: slugToId(row.slug),
                sourceName: row.sourceName,
                kc: row.kc,
                changedAt: row.lastChangedAtMs > 0 ? row.lastChangedAtMs : now,
                now,
            });
            written += 1;
        }
    })();
    return written;
}
