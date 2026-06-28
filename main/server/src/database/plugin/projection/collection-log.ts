import type Database from "better-sqlite3";
import { buildChangeEmitter } from "./change-inserter.js";
import type { HandlerCtx } from "./handler-ctx.js";
import { asNumber, asNumberNullable, asString, extractWhere, sanitizeItemName } from "./projection-utils.js";
import { upsertItemsCatalog } from "./items-catalog.js";
import {
    EVENT_COLLECTION_LOG_ENTRY,
    EVENT_COLLECTION_LOG_SNAPSHOT,
} from "../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../flows/registries/plugin-event-registry.js";

interface SnapshotItem {
    itemId: number;
    name?: string;
    quantity?: number;
    category?: string;
    price?: number;
}

interface CollectionLogEntry {
    itemId: number;
    itemName?: string;
    category?: string;
    sourceKind?: string;
}

interface UpsertItemArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    item: SnapshotItem;
    now: number;
}

function safeName(name: unknown): string {
    return sanitizeItemName(asString(name, ""));
}

function upsertItem(args: UpsertItemArgs): void {
    const { conn, accountHash, rsn, item, now } = args;
    const itemId = asNumberNullable(item.itemId);
    if (itemId === null) return;
    const itemName = safeName(item.name);
    const category = asString(item.category, "");
    const qty = asNumber(item.quantity, 0);
    conn.prepare(
        `INSERT INTO plugin_collection_log (account_hash, rsn, item_id, item_name, category, qty, first_seen, last_seen, updated_at)
         VALUES ($accountHash, $rsn, $itemId, $itemName, $category, $qty, $now, $now, $now)
         ON CONFLICT (account_hash, item_id) DO UPDATE SET
            rsn = excluded.rsn,
            item_name = excluded.item_name,
            category = excluded.category,
            qty = excluded.qty,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN qty != excluded.qty
                  OR item_name != excluded.item_name
                  OR category != excluded.category
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: rsn ?? "", itemId, accountHash, itemName, category, qty, now });
}

export function handleSnapshot(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    const items: SnapshotItem[] = Array.isArray(payload.items) ? payload.items : [];
    const catalogItems = items.map((i) => ({ id: i.itemId, name: i.name, price: i.price }));
    conn.transaction(() => {
        upsertItemsCatalog(conn, catalogItems, now);
        for (const item of items) upsertItem({ conn, accountHash, rsn, item, now });
    })();
}

interface CollectionEntryFacts {
    itemId: number;
    itemName: string;
    category: string;
    sourceKind: string;
}

function extractFacts(entry: CollectionLogEntry): CollectionEntryFacts | null {
    const itemId = asNumberNullable(entry.itemId);
    if (itemId === null) return null;
    return {
        itemId,
        itemName: safeName(entry.itemName),
        category: asString(entry.category, ""),
        sourceKind: asString(entry.sourceKind, "other"),
    };
}

const COLLECTION_LOG_CHANGE_COLS = ["item_id", "item_name", "category", "source_kind", "qty_signed"];

registerPluginEvent({
    eventType: EVENT_COLLECTION_LOG_SNAPSHOT,
    routing: "current-state",
    handler: handleSnapshot,
    payloadFields: [{ name: "items", type: "string" }],
});

export function handleEntry(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash, rsn } = id;
    const facts = extractFacts(payload as CollectionLogEntry);
    if (facts === null) return;
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_collection_log_changes", COLLECTION_LOG_CHANGE_COLS);
    conn.transaction(() => {
        upsertItem({
            conn,
            accountHash,
            rsn,
            now,
            item: { itemId: facts.itemId, name: facts.itemName, quantity: 1, category: facts.category },
        });
        emitter.emit({
            id,
            envelope,
            where,
            dedupKind: "collection_log_entry",
            dedupParts: [facts.itemId, facts.category, facts.sourceKind],
            specific: [facts.itemId, facts.itemName, facts.category, facts.sourceKind, 1],
        });
    })();
}

registerPluginEvent({
    eventType: EVENT_COLLECTION_LOG_ENTRY,
    routing: "current-state",
    handler: handleEntry,
    payloadFields: [
        { name: "itemId", type: "integer" },
        { name: "itemName", type: "string" },
        { name: "category", type: "string" },
        { name: "sourceKind", type: "string" },
    ],
});
