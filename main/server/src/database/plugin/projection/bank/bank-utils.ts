import { asNumberNullable, asString, sanitizeItemName } from "../projection-utils.js";

export function safeItemName(name: unknown): string {
    return sanitizeItemName(asString(name, ""));
}

export function safePrice(price: unknown): number | null {
    const p = asNumberNullable(price);
    return p !== null && p > 0 ? p : null;
}
