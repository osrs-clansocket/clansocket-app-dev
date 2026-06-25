import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import type { ContainerItem } from "./container-types.js";
import { itemName, itemPrice } from "./container-formatter.js";
import { validInvSlot } from "./container-slots.js";
import { snapshotPrune } from "./container-snapshot-prune.js";

export interface SnapshotInventoryArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    containerKind: string;
    items: ContainerItem[];
    now: number;
}

const INV_UPSERT_SQL = `INSERT INTO plugin_inventory (account_hash, rsn, container_kind, slot, item_id, item_name, qty, unit_price_gp, first_seen, last_seen, updated_at)
 VALUES ($accountHash, $rsn, $containerKind, $slot, $itemId, $itemName, $qty, $price, $now, $now, $now)
 ON CONFLICT (account_hash, container_kind, slot) DO UPDATE SET
    rsn = excluded.rsn,
    item_id = excluded.item_id,
    item_name = excluded.item_name,
    qty = excluded.qty,
    unit_price_gp = COALESCE(excluded.unit_price_gp, unit_price_gp),
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN item_id != excluded.item_id OR qty != excluded.qty
        THEN excluded.updated_at ELSE updated_at END`;

function runInvUpserts(upsert: Database.Statement, args: SnapshotInventoryArgs): number[] {
    const { accountHash, rsn, containerKind, items, now } = args;
    const keptSlots: number[] = [];
    logger.debug(`[inv-upserts] accountHash=${accountHash} kind=${containerKind} count=${items.length}`);
    for (const it of items) {
        const v = validInvSlot(it);
        if (v === null) continue;
        keptSlots.push(v.slot);
        upsert.run({
            accountHash,
            containerKind,
            now,
            slot: v.slot,
            qty: v.qty,
            rsn: rsn ?? "",
            itemId: it.id,
            itemName: itemName(it),
            price: itemPrice(it),
        });
    }
    return keptSlots;
}

export function snapshotInventory(args: SnapshotInventoryArgs): void {
    const { conn, accountHash, containerKind, items } = args;
    const upsert = conn.prepare(INV_UPSERT_SQL);
    logger.debug(`[inv-snapshot] accountHash=${accountHash} kind=${containerKind} items=${items.length}`);
    const keptSlots = runInvUpserts(upsert, args);
    snapshotPrune({
        conn,
        accountHash,
        table: "plugin_inventory",
        keyCol: "slot",
        keepKeys: keptSlots,
        extraClause: " AND container_kind = ?",
        extraParams: [containerKind],
    });
}
