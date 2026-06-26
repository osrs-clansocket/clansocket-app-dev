import { asNumber, asNumberNullable } from "../projection-utils.js";
import type { ContainerItem } from "./container-types.js";
import type { ValidatedItem } from "./slot-types.js";

export function basePositive(it: ContainerItem): ValidatedItem | null {
    const id = asNumberNullable(it.id);
    if (id === null || id <= 0) return null;
    const qty = asNumber(it.qty, 0);
    if (qty <= 0) return null;
    return { qty };
}

export const validatePositiveItem = basePositive;
