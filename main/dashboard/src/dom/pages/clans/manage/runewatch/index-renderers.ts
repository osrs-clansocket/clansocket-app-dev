import type { Instance } from "../../../../factory";
import { postRefresh, type RunewatchCase } from "../../../../../state/clans/runewatch/runewatch-client.js";
import type { getRunewatchStore, RunewatchData } from "../../../../../state/clans/runewatch/runewatch-store.js";
import { buildCaseCard, buildFlaggedCard, filterCases } from "./index-cards.js";
import type { BottomPaneKit, TopPaneKit } from "./index-panes.js";

const RENDER_CHUNK_SIZE = 50;

export interface RunewatchState {
    dataRef: RunewatchData;
    queryRef: { value: string };
    pendingCases: RunewatchCase[];
    renderedCount: number;
}

export function makeBottomRenderer(
    state: RunewatchState,
    kit: BottomPaneKit,
): { renderBottom: () => void; appendMoreCases: () => void } {
    const appendMoreCases = (): void => {
        if (state.renderedCount >= state.pendingCases.length) return;
        kit.sentinel.detach();
        const next = Math.min(state.renderedCount + RENDER_CHUNK_SIZE, state.pendingCases.length);
        for (let i = state.renderedCount; i < next; i += 1) {
            kit.bottomList.addChild(buildCaseCard(state.pendingCases[i]!));
        }
        state.renderedCount = next;
        if (state.renderedCount < state.pendingCases.length) kit.bottomList.addChild(kit.sentinel);
    };
    const renderBottom = (): void => {
        state.pendingCases = filterCases(state.dataRef.cases, state.queryRef.value);
        state.renderedCount = 0;
        kit.bottomList.setChildren();
        kit.bottomEmpty.el.hidden = state.pendingCases.length > 0;
        appendMoreCases();
    };
    return { renderBottom, appendMoreCases };
}

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

export function makeRefreshFn(
    slug: string,
    store: ReturnType<typeof getRunewatchStore>,
    refreshBtn: Instance<HTMLButtonElement>,
): () => Promise<void> {
    return async () => {
        refreshBtn.el.disabled = true;
        refreshBtn.setText("Refreshing…");
        try {
            await postRefresh(slug);
            await store.refresh();
        } finally {
            refreshBtn.el.disabled = false;
            refreshBtn.setText("Refresh now");
        }
    };
}

export function makeSentinelObserver(sentinel: Instance, appendMore: () => void): IntersectionObserver {
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((e) => e.isIntersecting)) appendMore();
        },
        { rootMargin: "2000px" },
    );
    observer.observe(sentinel.el);
    return observer;
}
