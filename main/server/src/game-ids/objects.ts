import { buildIdLookup } from "./lookup-builder.js";

export interface GameObject {
    object_id: number;
    name: string;
}

const objectLookup = buildIdLookup<GameObject>({ table: "objects", idCol: "object_id", cols: "object_id, name" });

export const lookupObject = (id: number): GameObject | null => objectLookup.one(id);
export const lookupObjects = (ids: readonly number[]): Map<number, GameObject> => objectLookup.many(ids);
