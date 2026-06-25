export const CONTAINER_SLOTS_MODULE = "container-slots" as const;
export { EQUIPMENT_SLOTS } from "./equipment-slots.js";
export {
    validatePositiveItem,
    validInvSlot,
    validEquipSlot,
    type ValidatedItem,
    type ValidInvSlot,
    type ValidEquipSlot,
} from "./slot-validators.js";
