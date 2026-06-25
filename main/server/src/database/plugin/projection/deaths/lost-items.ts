import type Database from "better-sqlite3";
import type { Payload } from "../projection-utils.js";

export interface LostItem {
    id?: number;
    itemId?: number;
    name?: string;
    itemName?: string;
    qty?: number;
    quantity?: number;
    price?: number;
}

export function readLostItems(payload: Payload): LostItem[] {
    const items = payload.lostItems ?? payload.items;
    return Array.isArray(items) ? items : [];
}

function lostId(item: LostItem): number | null {
    if (typeof item.id === "number") return item.id;
    if (typeof item.itemId === "number") return item.itemId;
    return null;
}

function lostName(item: LostItem): string {
    if (typeof item.name === "string") return item.name;
    if (typeof item.itemName === "string") return item.itemName;
    return "";
}

function lostQty(item: LostItem): number {
    if (typeof item.qty === "number") return item.qty;
    if (typeof item.quantity === "number") return item.quantity;
    return 0;
}

export function insertLostItem(insertLost: Database.Statement, deathId: number, item: LostItem): void {
    const itemId = lostId(item);
    if (itemId === null) return;
    const itemName = lostName(item);
    const qty = lostQty(item);
    const price = typeof item.price === "number" && item.price > 0 ? item.price : null;
    insertLost.run(deathId, itemId, itemName, qty, price);
}
