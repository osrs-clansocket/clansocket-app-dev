import { button, div, span, type Instance } from "../../factory";
import { reconcile } from "../../factory/live-ops/reconcile.js";
import { aiClient } from "../../../ai/client";

const CTX_CLASS = "ai-bar__context";
const TAG_CLASS = "ai-bar__ctx-tag";
const CLOSE_CLASS = "ai-bar__ctx-close";

function buildCtxTag(id: string): Instance {
    const closeBtn = button({
        classes: [CLOSE_CLASS],
        compact: true,
        text: "×",
        data: { unpin: id },
        context: "unpin this ai context tag",
        meta: ["action"],
    });
    return span({ classes: [TAG_CLASS], text: id, context: null, meta: null }, [closeBtn]);
}

interface CtxState {
    ctxBar: Instance;
    tagState: Map<string, Instance>;
}
const STATE = new WeakMap<HTMLElement, CtxState>();

function ensureCtxState(barEl: HTMLElement): CtxState {
    const cached = STATE.get(barEl);
    if (cached !== undefined) return cached;
    const ctxBar = div({
        classes: [CTX_CLASS],
        context: null,
        meta: null,
        onClick: async (e) => {
            const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-unpin]");
            if (btn === null) return;
            e.stopPropagation();
            const remaining = await aiClient.unpinContext([btn.dataset.unpin!]);
            renderContextBar(barEl, remaining);
        },
    });
    const inputRow = barEl.querySelector(".ai-bar__input-row");
    if (inputRow !== null) inputRow.before(ctxBar.el);
    else ctxBar.mount(barEl);
    const state: CtxState = { ctxBar, tagState: new Map() };
    STATE.set(barEl, state);
    return state;
}

function teardownCtxState(barEl: HTMLElement): void {
    const state = STATE.get(barEl);
    if (state === undefined) return;
    state.ctxBar.destroy();
    STATE.delete(barEl);
}

function renderContextBar(barEl: HTMLElement, pinned: string[]): void {
    if (pinned[0] === undefined) {
        teardownCtxState(barEl);
        return;
    }
    const state = ensureCtxState(barEl);
    reconcile<string>({
        container: state.ctxBar,
        state: state.tagState,
        items: pinned,
        keyOf: (id) => id,
        create: (id) => buildCtxTag(id),
    });
}

export { renderContextBar };
