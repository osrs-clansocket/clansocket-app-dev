import { buildIdLookup } from "./lookup-builder.js";

const ITEM_COLS = "item_id, name, stackable, tradeable, noted, linked_note_id";

export interface GameItem {
    item_id: number;
    name: string;
    stackable: number;
    tradeable: number;
    noted: number;
    linked_note_id: number;
}

const itemLookup = buildIdLookup<GameItem>({ table: "items", idCol: "item_id", cols: ITEM_COLS });

export const lookupItem = (id: number): GameItem | null => itemLookup.one(id);
export const lookupItems = (ids: readonly number[]): Map<number, GameItem> => itemLookup.many(ids);
