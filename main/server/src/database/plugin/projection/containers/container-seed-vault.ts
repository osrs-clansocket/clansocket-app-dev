import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import type { ContainerItem } from "./container-types.js";
import { aggregateById } from "./container-aggregator.js";
import { snapshotPrune } from "./container-snapshot-prune.js";

interface SnapshotItemsArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    items: ContainerItem[];
    now: number;
}

const SEED_VAULT_UPSERT_SQL = `INSERT INTO plugin_seed_vault (account_hash, rsn, item_id, item_name, qty, unit_price_gp, first_seen, last_seen, updated_at)
 VALUES ($accountHash, $rsn, $itemId, $itemName, $qty, $price, $now, $now, $now)
 ON CONFLICT (account_hash, item_id) DO UPDATE SET
    rsn = excluded.rsn,
    item_name = excluded.item_name,
    qty = excluded.qty,
    unit_price_gp = COALESCE(excluded.unit_price_gp, unit_price_gp),
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN qty != excluded.qty OR item_name != excluded.item_name
        THEN excluded.updated_at ELSE updated_at END`;

interface SeedUpsertCtx {
    conn: SnapshotItemsArgs["conn"];
    agg: Record<string, { name: string; qty: number; price: number | null }>;
    accountHash: string;
    rsn: string | null;
    now: number;
}

function runSeedUpserts(c: SeedUpsertCtx): void {
    const upsert = c.conn.prepare(SEED_VAULT_UPSERT_SQL);
    logger.debug(`[seed-vault] upserts accountHash=${c.accountHash} count=${Object.keys(c.agg).length}`);
    for (const [id, e] of Object.entries(c.agg)) {
        upsert.run({
            accountHash: c.accountHash,
            now: c.now,
            rsn: c.rsn ?? "",
            itemId: Number(id),
            itemName: e.name,
            qty: e.qty,
            price: e.price,
        });
    }
}

export function snapshotSeedVault(args: SnapshotItemsArgs): void {
    const { conn, accountHash, rsn, items, now } = args;
    const agg = aggregateById(items);
    logger.debug(
        `[seed-vault] snapshot accountHash=${accountHash} items=${items.length} agg=${Object.keys(agg).length}`,
    );
    runSeedUpserts({ conn, agg, accountHash, rsn, now });
    snapshotPrune({
        conn,
        accountHash,
        table: "plugin_seed_vault",
        keyCol: "item_id",
        keepKeys: Object.keys(agg).map((k) => Number(k)),
    });
}
