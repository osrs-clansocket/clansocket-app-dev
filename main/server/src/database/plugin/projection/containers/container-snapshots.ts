import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import type { ContainerItem } from "./container-types.js";
import { itemName, itemPrice } from "./container-formatter.js";
import { validEquipSlot } from "./container-slots.js";
import { snapshotPrune } from "./container-snapshot-prune.js";

export { snapshotSeedVault } from "./container-seed-vault.js";
export { snapshotInventory, type SnapshotInventoryArgs } from "./container-snapshot-inventory.js";

interface SnapshotItemsArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    items: ContainerItem[];
    now: number;
}

const EQUIP_UPSERT_SQL = `INSERT INTO plugin_equipment (account_hash, rsn, slot, item_id, item_name, qty, unit_price_gp, first_seen, last_seen, updated_at)
 VALUES ($accountHash, $rsn, $slotName, $itemId, $itemName, $qty, $price, $now, $now, $now)
 ON CONFLICT (account_hash, slot) DO UPDATE SET
    rsn = excluded.rsn,
    item_id = excluded.item_id,
    item_name = excluded.item_name,
    qty = excluded.qty,
    unit_price_gp = COALESCE(excluded.unit_price_gp, unit_price_gp),
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN item_id != excluded.item_id OR qty != excluded.qty
        THEN excluded.updated_at ELSE updated_at END`;

export function snapshotEquipment(args: SnapshotItemsArgs): void {
    const { conn, accountHash, rsn, items, now } = args;
    const upsert = conn.prepare(EQUIP_UPSERT_SQL);
    logger.debug(`[equip-snapshot] accountHash=${accountHash} items=${items.length}`);
    const keptSlots: string[] = [];
    for (const it of items) {
        const v = validEquipSlot(it);
        if (v === null) continue;
        keptSlots.push(v.slotName);
        upsert.run({
            accountHash,
            now,
            slotName: v.slotName,
            qty: v.qty,
            rsn: rsn ?? "",
            itemId: it.id,
            itemName: itemName(it),
            price: itemPrice(it),
        });
    }
    snapshotPrune({ conn, accountHash, table: "plugin_equipment", keyCol: "slot", keepKeys: keptSlots });
}
