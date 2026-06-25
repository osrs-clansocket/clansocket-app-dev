import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { HAS_COMBAT_CLASS } from "../../../../shared/constants/state-modifier-constants.js";
import { combatLines } from "./names-combat.js";
import type { CardRefs } from "./names-card.js";
import { patchCombat } from "./names-patch-combat.js";
import { syncPrayerImages } from "./names-patch-prayer.js";
import { patchVitals } from "./names-patch-vitals.js";
import { patchCardPosition } from "./names-patch-pos.js";

export type NamesRow = PositionsState["byHash"] extends Map<string, infer R> ? R : never;

export { upsertCardIn, purgeStaleCards } from "./names-patch-pool.js";

export function patchCard(card: CardRefs, row: NamesRow, px: number, py: number): void {
    patchVitals(card, row);
    const lines = combatLines(row, Date.now());
    const line = lines.length > 0 ? lines[0] : null;
    patchCombat(card, line);
    const hasCombat = line !== null;
    if (hasCombat !== card.lastHasCombat) {
        card.instance.el.classList.toggle(HAS_COMBAT_CLASS, hasCombat);
        card.lastHasCombat = hasCombat;
    }
    syncPrayerImages(card, row.active_prayers);
    patchCardPosition(card, px, py);
}
