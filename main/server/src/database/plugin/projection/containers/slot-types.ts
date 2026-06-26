export interface ValidatedItem {
    qty: number;
}

export interface ValidInvSlot extends ValidatedItem {
    slot: number;
}

export interface ValidEquipSlot extends ValidatedItem {
    slotName: string;
}
