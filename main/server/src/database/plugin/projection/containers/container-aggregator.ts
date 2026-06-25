import type { ContainerItem } from "./container-types.js";
import { itemName, itemPrice } from "./container-formatter.js";
import { validatePositiveItem } from "./container-slots.js";

export interface AggItem {
    qty: number;
    name: string;
    price: number | null;
}

function mergeAggItem(cur: AggItem, qty: number, it: ContainerItem): void {
    cur.qty += qty;
    if (it.name) cur.name = it.name;
    const p = itemPrice(it);
    if (p !== null) cur.price = p;
}

export function aggregateById(items: ContainerItem[]): Record<number, AggItem> {
    const agg: Record<number, AggItem> = {};
    for (const it of items) {
        const v = validatePositiveItem(it);
        if (v === null) continue;
        const cur = agg[it.id];
        if (cur) mergeAggItem(cur, v.qty, it);
        else agg[it.id] = { qty: v.qty, name: itemName(it), price: itemPrice(it) };
    }
    return agg;
}
