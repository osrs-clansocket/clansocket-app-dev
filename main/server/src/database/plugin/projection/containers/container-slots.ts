export const CONTAINER_SLOTS_MODULE = "container-slots" as const;
export { EQUIPMENT_SLOTS } from "./equipment-slots.js";
export { validatePositiveItem } from "./validator-base-positive.js";
export { validInvSlot } from "./validator-inv-slot.js";
export { validEquipSlot } from "./validator-equip-slot.js";
export type { ValidatedItem, ValidInvSlot, ValidEquipSlot } from "./slot-types.js";
