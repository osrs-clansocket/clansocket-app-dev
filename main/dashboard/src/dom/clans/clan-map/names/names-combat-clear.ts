import type { PositionRow } from "../../../../state/clans/stores/positions-store.js";

const ENGAGED_MS = 4000;

export const COMBAT_ENGAGED_MS = ENGAGED_MS;

export function shouldClearCombat(row: PositionRow, nowMs: number): boolean {
    if (row.interacting_name === null || row.interacting_name.length === 0) return true;
    const recent = (t: number | null): boolean => t !== null && nowMs - t < ENGAGED_MS;
    return !recent(row.last_damage_dealt_at) && !recent(row.last_damage_taken_at);
}
