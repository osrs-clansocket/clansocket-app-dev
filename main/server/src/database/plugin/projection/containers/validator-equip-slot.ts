import { asNumberNullable } from "../projection-utils.js";
import type { ContainerItem } from "./container-types.js";
import { EQUIPMENT_SLOTS } from "./equipment-slots.js";
import type { ValidEquipSlot } from "./slot-types.js";
import { basePositive } from "./validator-base-positive.js";

export function validEquipSlot(it: ContainerItem): ValidEquipSlot | null {
    const v = basePositive(it);
    if (v === null) return null;
    const slot = asNumberNullable(it.slot);
    const slotName = slot !== null ? EQUIPMENT_SLOTS[slot] : undefined;
    if (!slotName) return null;
    return { qty: v.qty, slotName };
}
