import type { Instance } from "../../../factory/core";
import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import type { CardRefs } from "./names-card.js";
import { patchCard } from "./names-patch.js";

type NamesRow = PositionsState["byHash"] extends Map<string, infer R> ? R : never;

interface UpsertCardArgs {
    root: Instance;
    pool: Map<string, CardRefs>;
    row: NamesRow;
    px: number;
    py: number;
}

export function upsertCardIn(a: UpsertCardArgs, buildOne: (rsn: string) => CardRefs): void {
    let card = a.pool.get(a.row.account_hash);
    if (card === undefined) {
        card = buildOne(a.row.latest_rsn);
        a.pool.set(a.row.account_hash, card);
        a.root.addChild(card.instance);
    }
    patchCard(card, a.row, a.px, a.py);
}

export function purgeStaleCards(pool: Map<string, CardRefs>, live: Set<string>): void {
    for (const [hash, card] of pool) {
        if (!live.has(hash)) {
            card.instance.destroy();
            pool.delete(hash);
        }
    }
}
