import { asNumber } from "../projection-utils.js";
import type { ContainerItem } from "./container-types.js";
import type { ValidInvSlot } from "./slot-types.js";
import { basePositive } from "./validator-base-positive.js";

export function validInvSlot(it: ContainerItem): ValidInvSlot | null {
    const v = basePositive(it);
    if (v === null) return null;
    const slot = asNumber(it.slot, -1);
    if (slot < 0) return null;
    return { qty: v.qty, slot };
}
