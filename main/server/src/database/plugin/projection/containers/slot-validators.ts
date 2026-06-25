import { asNumber, asNumberNullable } from "../projection-utils.js";
import type { ContainerItem } from "./container-types.js";
import { EQUIPMENT_SLOTS } from "./equipment-slots.js";

export interface ValidatedItem {
    qty: number;
}

export interface ValidInvSlot extends ValidatedItem {
    slot: number;
}

export interface ValidEquipSlot extends ValidatedItem {
    slotName: string;
}

function basePositive(it: ContainerItem): ValidatedItem | null {
    const id = asNumberNullable(it.id);
    if (id === null || id <= 0) return null;
    const qty = asNumber(it.qty, 0);
    if (qty <= 0) return null;
    return { qty };
}

export const validatePositiveItem = basePositive;

export function validInvSlot(it: ContainerItem): ValidInvSlot | null {
    const v = basePositive(it);
    if (v === null) return null;
    const slot = asNumber(it.slot, -1);
    if (slot < 0) return null;
    return { qty: v.qty, slot };
}

export function validEquipSlot(it: ContainerItem): ValidEquipSlot | null {
    const v = basePositive(it);
    if (v === null) return null;
    const slot = asNumberNullable(it.slot);
    const slotName = slot !== null ? EQUIPMENT_SLOTS[slot] : undefined;
    if (!slotName) return null;
    return { qty: v.qty, slotName };
}
