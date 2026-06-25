import { buildIdLookup } from "./lookup-builder.js";

export interface GameNpc {
    npc_id: number;
    name: string;
}

const npcLookup = buildIdLookup<GameNpc>({ table: "npcs", idCol: "npc_id", cols: "npc_id, name" });

export const lookupNpc = (id: number): GameNpc | null => npcLookup.one(id);
export const lookupNpcs = (ids: readonly number[]): Map<number, GameNpc> => npcLookup.many(ids);
