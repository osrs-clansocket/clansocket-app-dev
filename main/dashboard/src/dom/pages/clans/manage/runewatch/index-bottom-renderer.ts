import type { Instance } from "../../../../factory";
import type { RunewatchCase } from "../../../../../state/clans/runewatch/runewatch-client.js";
import type { RunewatchData } from "../../../../../state/clans/runewatch/runewatch-store.js";
import { buildCaseCard, filterCases } from "./index-cards.js";
import type { BottomPaneKit } from "./index-panes.js";

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
            const card: Instance<HTMLElement> = buildCaseCard(state.pendingCases[i]!);
            kit.bottomList.addChild(card);
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
