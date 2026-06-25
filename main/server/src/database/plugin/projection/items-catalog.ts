import type Database from "better-sqlite3";
import logger from "@clansocket/logger";

import { sanitizeItemName } from "./projection-utils.js";

export interface ItemCatalogEntry {
    id?: number;
    itemId?: number;
    name?: string;
    itemName?: string;
    price?: number;
    unit_price_gp?: number;
}

export function upsertItemsCatalog(conn: Database.Database, entries: ItemCatalogEntry[], now: number): void {
    if (entries.length === 0) return;
    const stmt = conn.prepare(
        `INSERT INTO plugin_items_catalog (item_id, item_name, price_gp, last_seen_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (item_id) DO UPDATE SET
            item_name = COALESCE(NULLIF(excluded.item_name, ''), item_name),
            price_gp = CASE WHEN excluded.price_gp > 0 THEN excluded.price_gp ELSE price_gp END,
            last_seen_at = excluded.last_seen_at`,
    );
    for (const e of entries) {
        const itemId = catalogId(e);
        if (itemId === null) continue;
        const itemName = sanitizeItemName(catalogName(e));
        const price = pickCatalogPrice(e);
        stmt.run(itemId, itemName, price, now);
    }
    logger.debug(`[items-catalog] upsert entries=${entries.length}`);
}

function catalogId(e: ItemCatalogEntry): number | null {
    if (typeof e.itemId === "number") return e.itemId;
    if (typeof e.id === "number") return e.id;
    return null;
}

function catalogName(e: ItemCatalogEntry): string {
    if (typeof e.itemName === "string" && e.itemName.length > 0) return e.itemName;
    if (typeof e.name === "string" && e.name.length > 0) return e.name;
    return "";
}

function pickCatalogPrice(e: ItemCatalogEntry): number {
    if (typeof e.price === "number" && e.price > 0) return e.price;
    if (typeof e.unit_price_gp === "number" && e.unit_price_gp > 0) return e.unit_price_gp;
    return 0;
}

export function catalogPrice(conn: Database.Database, itemId: number): number | null {
    const row = conn.prepare("SELECT price_gp FROM plugin_items_catalog WHERE item_id = ?").get(itemId) as
        | { price_gp: number }
        | undefined;
    return row && row.price_gp > 0 ? row.price_gp : null;
}
