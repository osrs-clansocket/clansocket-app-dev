import type { PositionRow } from "../../../../state/clans/stores/positions-store.js";
import type { CombatLine } from "./names-combat-types.js";
import { dropAccum, ensureAccum } from "./names-combat-store.js";
import { COMBAT_ENGAGED_MS, shouldClearCombat } from "./names-combat-clear.js";

export type { CombatLine } from "./names-combat-types.js";

export function combatLines(row: PositionRow, nowMs: number): CombatLine[] {
    if (shouldClearCombat(row, nowMs)) {
        dropAccum(row.account_hash);
        return [];
    }
    const dealtAt = row.last_damage_dealt_at;
    const accum = ensureAccum(row);
    if (dealtAt !== null && nowMs - dealtAt < COMBAT_ENGAGED_MS && dealtAt > accum.lastDealtAt) {
        accum.totalDealt += row.last_damage_dealt_amount ?? 0;
        accum.lastDealtAt = dealtAt;
    }
    const label = accum.multipleKills ? `${accum.target}'s` : accum.target;
    return [{ target: label, dealt: accum.totalDealt > 0 ? accum.totalDealt : null }];
}
