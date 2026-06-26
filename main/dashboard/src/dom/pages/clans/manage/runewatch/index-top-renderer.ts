import type { Instance } from "../../../../factory";
import { buildFlaggedCard } from "./index-cards.js";
import type { TopPaneKit } from "./index-panes.js";
import type { RunewatchState } from "./index-bottom-renderer.js";

export function makeTopRenderer(args: {
    state: RunewatchState;
    top: TopPaneKit;
    flaggedPool: Map<string, Instance<HTMLElement>>;
}): () => void {
    const { state, top, flaggedPool } = args;
    return (): void => {
        const flagged = state.dataRef.flagged;
        const liveKeys = new Set<string>();
        for (const m of flagged) {
            const key = m.rsn_normalized;
            liveKeys.add(key);
            let card = flaggedPool.get(key);
            if (card === undefined) {
                card = buildFlaggedCard(m);
                flaggedPool.set(key, card);
                top.topList.addChild(card);
            }
            card.el.hidden = false;
        }
        for (const [key, card] of flaggedPool) if (!liveKeys.has(key)) card.el.hidden = true;
        top.topEmpty.el.hidden = flagged.length > 0;
    };
}
