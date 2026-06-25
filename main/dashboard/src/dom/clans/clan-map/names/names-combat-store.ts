import type { PositionRow } from "../../../../state/clans/stores/positions-store.js";
import type { CombatAccum } from "./names-combat-types.js";
import { BoundedCache } from "../../../../state/caches/bounded-cache.js";

const MAX_COMBAT_ENTRIES = 200;

const combatAccumulators = new BoundedCache<string, CombatAccum>({
    tag: "clan-map",
    maxEntries: MAX_COMBAT_ENTRIES,
    evictionPolicy: "lru",
});

function updateAccumInteracting(accum: CombatAccum, interactingId: number | null): void {
    if (interactingId === null) return;
    if (accum.interactingId !== null && interactingId !== accum.interactingId) {
        accum.multipleKills = true;
        accum.interactingId = interactingId;
    } else if (accum.interactingId === null) {
        accum.interactingId = interactingId;
    }
}

export function ensureAccum(row: PositionRow): CombatAccum {
    const cached = combatAccumulators.get(row.account_hash);
    if (cached !== undefined && cached.target === row.interacting_name) {
        updateAccumInteracting(cached, row.interacting_id);
        return cached;
    }
    if (cached !== undefined) combatAccumulators.delete(row.account_hash);
    const created: CombatAccum = {
        target: row.interacting_name!,
        lastDealtAt: 0,
        totalDealt: 0,
        interactingId: row.interacting_id,
        multipleKills: false,
    };
    combatAccumulators.set(row.account_hash, created);
    return created;
}

export function dropAccum(accountHash: string): void {
    combatAccumulators.delete(accountHash);
}
