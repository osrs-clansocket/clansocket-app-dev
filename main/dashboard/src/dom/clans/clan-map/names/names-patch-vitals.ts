import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import type { CardRefs } from "./names-card.js";

type NamesRow = PositionsState["byHash"] extends Map<string, infer R> ? R : never;

export function patchVitals(card: CardRefs, row: NamesRow): void {
    const region = row.location_region_name || "—";
    if (region !== card.lastRegion) {
        card.regionInst.setText(region);
        card.lastRegion = region;
    }
    const hp = `${row.hitpoints}/${row.max_hitpoints}`;
    if (hp !== card.lastHp) {
        card.hpInst.setText(hp);
        card.lastHp = hp;
    }
    const pr = `${row.prayer}/${row.max_prayer}`;
    if (pr !== card.lastPrayer) {
        card.prayerInst.setText(pr);
        card.lastPrayer = pr;
    }
}
