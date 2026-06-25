import { sanitizeItemName } from "../projection-utils.js";
import type { ContainerItem } from "./container-types.js";

export function itemName(item: ContainerItem): string {
    return typeof item.name === "string" ? sanitizeItemName(item.name) : "";
}

export function itemPrice(item: ContainerItem): number | null {
    return typeof item.price === "number" && item.price > 0 ? item.price : null;
}

export function isLiveChange(c: ContainerItem): boolean {
    return typeof c.id === "number" && c.id > 0 && typeof c.qty === "number" && c.qty !== 0;
}
