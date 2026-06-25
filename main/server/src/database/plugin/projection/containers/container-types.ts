export interface ContainerItem {
    id: number;
    qty: number;
    name?: string;
    price?: number;
    slot?: number;
}

export interface RunePouchSlot {
    slot: number;
    itemId: number;
    qty: number;
    name?: string;
    price?: number;
}

export type ContainerCause = { action?: string; option?: string; target?: string; id?: number } | undefined;

export const INVENTORY = "INVENTORY";
export const EQUIPMENT = "EQUIPMENT";
export const SEED_VAULT = "SEED_VAULT";
export const KIND_MAIN = "MAIN";
export const KIND_RUNE_POUCH = "RUNE_POUCH";
